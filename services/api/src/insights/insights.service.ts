import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseService } from "../database/database.service";

type InsightStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
type InsightRow = {
  id: string; channel: string; category: string; title: string; title_zh: string;
  summary: string; summary_zh: string; source: string; source_zh: string;
  source_url: string; source_published_at: string | null; read_minutes: number;
  status: InsightStatus; collected_at: string; reviewed_at: string | null;
  reviewed_by: string | null; published_at: string | null; rejected_reason: string | null;
  collection_run_id: string | null; payload_json: string;
};

type ArticlePayload = Record<string, unknown> & {
  id?: string; channel?: string; category?: string; title?: string; titleZh?: string;
  summary?: string; summaryZh?: string; source?: string; sourceZh?: string;
  sourceUrl?: string; sourcePublishedAt?: string; publishedAt?: string; readMinutes?: number;
};

const sources = [
  { id: "100ppi", name: "生意社", url: "https://www.100ppi.com/", focus: "大宗商品与产业链价格", enabled: true },
  { id: "jin10", name: "金十数据", url: "https://www.jin10.com/", focus: "宏观与金融市场", enabled: true },
  { id: "chinaventure", name: "投中网", url: "https://www.chinaventure.com.cn/", focus: "一级市场投融资", enabled: true },
  { id: "wallstreetcn", name: "华尔街见闻", url: "https://wallstreetcn.com/", focus: "全球资本市场", enabled: true },
  { id: "10jqka", name: "同花顺", url: "https://www.10jqka.com.cn/", focus: "上市公司与年报", enabled: true },
  { id: "xueqiu", name: "雪球", url: "https://xueqiu.com/", focus: "投资者关注与公司线索", enabled: true }
];

@Injectable()
export class InsightsService implements OnModuleInit, OnModuleDestroy {
  private seedCatalog: ArticlePayload[] = [];
  private collectionTimer?: NodeJS.Timeout;

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.loadSeedCatalog();
    this.seedPublishedEdition();
    if (process.env.INSIGHTS_AUTO_COLLECT === "true" && process.env.INSIGHTS_COLLECTOR_URL) {
      this.collectionTimer = setInterval(() => void this.runScheduledCollection(), 60_000);
      this.collectionTimer.unref();
      void this.runScheduledCollection();
    }
  }

  onModuleDestroy() {
    if (this.collectionTimer) clearInterval(this.collectionTimer);
  }

  listPublished(category?: string) {
    const params: string[] = ["PUBLISHED"];
    let where = "status = ?";
    if (category) { where += " AND category = ?"; params.push(category); }
    const rows = this.database.connection.prepare(
      `SELECT * FROM insight_articles WHERE ${where} ORDER BY published_at DESC, collected_at DESC`
    ).all(...params) as unknown as InsightRow[];
    const items = rows.map((row) => this.view(row));
    return {
      edition: {
        id: `SQJ-${new Date().toISOString().slice(0, 10)}`,
        status: "PUBLISHED",
        selectedCount: items.length,
        targetCount: 10,
        scheduledAt: items[0]?.publishedAt || null
      },
      agent: {
        name: "商情局市场情报 Agent",
        schedule: "07:30 / 12:00 / 17:00",
        reviewPolicy: "HUMAN_REVIEW_REQUIRED",
        workflow: ["线索采集", "归一化去重", "深度稿草稿", "人工审核", "发布"]
      },
      discoverySources: sources,
      primaryMarket: items.filter((item) => item.channel === "PRIMARY"),
      secondaryMarket: items.filter((item) => item.channel !== "PRIMARY")
    };
  }

  getPublished(id: string) {
    const row = this.require(id);
    if (row.status !== "PUBLISHED") throw new NotFoundException("资讯尚未发布");
    return this.view(row);
  }

  listForAdmin(status?: string) {
    const rows = status
      ? this.database.connection.prepare("SELECT * FROM insight_articles WHERE status = ? ORDER BY collected_at DESC").all(status)
      : this.database.connection.prepare("SELECT * FROM insight_articles ORDER BY collected_at DESC").all();
    const items = (rows as unknown as InsightRow[]).map((row) => this.view(row));
    const runs = this.database.connection.prepare("SELECT * FROM insight_collection_runs ORDER BY started_at DESC LIMIT 10").all();
    return {
      items,
      sources,
      runs,
      metrics: {
        total: items.length,
        pending: items.filter((item) => item.status === "PENDING_REVIEW").length,
        published: items.filter((item) => item.status === "PUBLISHED").length,
        rejected: items.filter((item) => item.status === "REJECTED").length
      }
    };
  }

  async collect(operator: string, supplied?: Record<string, unknown>[], scheduleSlot?: string) {
    let candidates = supplied as ArticlePayload[] | undefined;
    let mode = supplied?.length ? "CRAWLER_INGEST" : "SOURCE_SNAPSHOT_IMPORT";
    if (!candidates?.length && process.env.INSIGHTS_COLLECTOR_URL) {
      try {
        const response = await fetch(process.env.INSIGHTS_COLLECTOR_URL, {
          headers: process.env.INSIGHTS_COLLECTOR_TOKEN
            ? { Authorization: `Bearer ${process.env.INSIGHTS_COLLECTOR_TOKEN}` }
            : undefined,
          signal: AbortSignal.timeout(30_000)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json() as { items?: ArticlePayload[] } | ArticlePayload[];
        candidates = Array.isArray(payload) ? payload : payload.items;
        if (!candidates?.length) throw new Error("采集器未返回文章");
        mode = "CRAWLER_INGEST";
      } catch (error) {
        throw new ServiceUnavailableException(`资讯采集器调用失败：${error instanceof Error ? error.message : "未知错误"}`);
      }
    }
    return this.persistCollection(operator, candidates, mode, scheduleSlot);
  }

  private persistCollection(operator: string, supplied: ArticlePayload[] | undefined, mode: string, scheduleSlot?: string) {
    const now = new Date().toISOString();
    const runId = `INS-RUN-${randomUUID().slice(0, 10).toUpperCase()}`;
    const candidates = (supplied?.length ? supplied : this.nextSeedCandidates()).slice(0, 10) as ArticlePayload[];
    const insert = this.database.connection.prepare(`INSERT INTO insight_articles
      (id, channel, category, title, title_zh, summary, summary_zh, source, source_zh,
       source_url, source_published_at, read_minutes, status, collected_at, collection_run_id, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_REVIEW', ?, ?, ?)`);
    const db = this.database.connection;
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const [index, raw] of candidates.entries()) {
        const payload = this.normalizeCandidate(raw, runId, index);
        insert.run(
          payload.id, payload.channel, payload.category, payload.title, payload.titleZh,
          payload.summary, payload.summaryZh, payload.source, payload.sourceZh,
          payload.sourceUrl, payload.sourcePublishedAt || null, payload.readMinutes,
          now, runId, JSON.stringify(payload)
        );
      }
      db.prepare(`INSERT INTO insight_collection_runs
        (id, status, source_count, candidate_count, started_at, completed_at, mode, summary_json)
        VALUES (?, 'COMPLETED', ?, ?, ?, ?, ?, ?)`)
        .run(runId, sources.filter((item) => item.enabled).length, candidates.length, now, now,
          mode,
          JSON.stringify({ operator, reviewRequired: true, scheduleSlot: scheduleSlot || null }));
      this.audit(null, operator, "COLLECT", `${candidates.length} 篇候选稿进入人工审核`, now);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
    return { runId, status: "COMPLETED", candidateCount: candidates.length, reviewRequired: true, mode };
  }

  private async runScheduledCollection() {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const schedule = (process.env.INSIGHTS_COLLECT_SCHEDULE || "07:30,12:00,17:00")
      .split(",").map((item) => item.trim()).filter(Boolean);
    if (!schedule.includes(current)) return;
    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const existing = this.database.connection.prepare(`SELECT id FROM insight_collection_runs
      WHERE started_at >= ? AND summary_json LIKE ? LIMIT 1`)
      .get(dayStart.toISOString(), `%\"scheduleSlot\":\"${current}\"%`);
    if (existing) return;
    await this.collect("SYSTEM_SCHEDULER", undefined, current);
  }

  approve(id: string, operator: string) {
    const row = this.require(id);
    if (row.status === "PUBLISHED") return this.view(row);
    const now = new Date().toISOString();
    const payload = JSON.parse(row.payload_json) as ArticlePayload;
    payload.publishedAt = now;
    this.database.connection.prepare(`UPDATE insight_articles SET
      status='PUBLISHED', reviewed_at=?, reviewed_by=?, published_at=?, rejected_reason=NULL, payload_json=? WHERE id=?`)
      .run(now, operator, now, JSON.stringify(payload), id);
    this.audit(id, operator, "APPROVE_AND_PUBLISH", "人工审核通过并发布到客户端", now);
    return this.view(this.require(id));
  }

  reject(id: string, operator: string, reason: string) {
    this.require(id);
    const now = new Date().toISOString();
    this.database.connection.prepare(`UPDATE insight_articles SET
      status='REJECTED', reviewed_at=?, reviewed_by=?, rejected_reason=? WHERE id=?`)
      .run(now, operator, reason, id);
    this.audit(id, operator, "REJECT", reason, now);
    return this.view(this.require(id));
  }

  remove(id: string, operator: string) {
    this.require(id);
    const now = new Date().toISOString();
    this.audit(id, operator, "DELETE", "运营人员删除候选稿", now);
    this.database.connection.prepare("DELETE FROM insight_articles WHERE id = ?").run(id);
    return { id, deleted: true };
  }

  private async loadSeedCatalog() {
    try {
      const file = join(process.cwd(), "../mock-upstream/fixtures/insights.json");
      const fixture = JSON.parse(await readFile(file, "utf8")) as { primaryMarket?: ArticlePayload[]; secondaryMarket?: ArticlePayload[] };
      this.seedCatalog = [...(fixture.primaryMarket || []), ...(fixture.secondaryMarket || [])];
    } catch {
      this.seedCatalog = [];
    }
  }

  private seedPublishedEdition() {
    const count = this.database.connection.prepare("SELECT COUNT(*) AS count FROM insight_articles").get() as { count: number };
    if (Number(count.count) || !this.seedCatalog.length) return;
    const insert = this.database.connection.prepare(`INSERT INTO insight_articles
      (id, channel, category, title, title_zh, summary, summary_zh, source, source_zh,
       source_url, source_published_at, read_minutes, status, collected_at, reviewed_at,
       reviewed_by, published_at, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, 'SYSTEM_SEED', ?, ?)`);
    const now = new Date().toISOString();
    for (const [index, raw] of this.seedCatalog.entries()) {
      const payload = this.normalizeCandidate(raw, "INITIAL-EDITION", index, false);
      const publishedAt = String(raw.publishedAt || now);
      payload.publishedAt = publishedAt;
      insert.run(payload.id, payload.channel, payload.category, payload.title, payload.titleZh,
        payload.summary, payload.summaryZh, payload.source, payload.sourceZh, payload.sourceUrl,
        payload.sourcePublishedAt || null, payload.readMinutes, now, now, publishedAt, JSON.stringify(payload));
    }
  }

  private nextSeedCandidates() {
    if (!this.seedCatalog.length) throw new NotFoundException("未配置可采集的资讯源快照");
    const offset = Math.floor(Date.now() / 1000) % this.seedCatalog.length;
    return Array.from({ length: Math.min(5, this.seedCatalog.length) }, (_, index) => this.seedCatalog[(offset + index) % this.seedCatalog.length]);
  }

  private normalizeCandidate(raw: ArticlePayload, runId: string, index: number, unique = true) {
    const suffix = unique ? `-${Date.now()}-${index}-${randomUUID().slice(0, 4)}` : "";
    const id = `${String(raw.id || `INSIGHT-${index}`)}${suffix}`;
    return {
      ...raw,
      id,
      channel: String(raw.channel || "SECONDARY"),
      category: String(raw.category || "OTHER"),
      title: String(raw.title || raw.titleZh || "Untitled market intelligence"),
      titleZh: String(raw.titleZh || raw.title || "未命名市场情报"),
      summary: String(raw.summary || raw.summaryZh || ""),
      summaryZh: String(raw.summaryZh || raw.summary || ""),
      source: String(raw.source || raw.sourceZh || "Public source"),
      sourceZh: String(raw.sourceZh || raw.source || "公开来源"),
      sourceUrl: String(raw.sourceUrl || ""),
      sourcePublishedAt: raw.sourcePublishedAt ? String(raw.sourcePublishedAt) : undefined,
      readMinutes: Math.max(1, Number(raw.readMinutes || 6)),
      collectionRunId: runId,
      author: raw.author || "Shangqingju Research Agent · Pending human review",
      authorZh: "商情局研究 Agent · 待人工复核"
    };
  }

  private require(id: string) {
    const row = this.database.connection.prepare("SELECT * FROM insight_articles WHERE id = ?").get(id) as InsightRow | undefined;
    if (!row) throw new NotFoundException("资讯文章不存在");
    return row;
  }

  private view(row: InsightRow) {
    const payload = JSON.parse(row.payload_json) as ArticlePayload;
    return {
      ...payload,
      id: row.id,
      channel: row.channel,
      category: row.category,
      title: row.title,
      titleZh: row.title_zh,
      summary: row.summary,
      summaryZh: row.summary_zh,
      source: row.source,
      sourceZh: row.source_zh,
      sourceUrl: row.source_url,
      sourcePublishedAt: row.source_published_at,
      readMinutes: row.read_minutes,
      status: row.status,
      collectedAt: row.collected_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      publishedAt: row.published_at,
      rejectedReason: row.rejected_reason,
      collectionRunId: row.collection_run_id
    };
  }

  private audit(articleId: string | null, operator: string, action: string, note: string, at: string) {
    this.database.connection.prepare(`INSERT INTO insight_audit_logs
      (id, article_id, operator, action, note, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(`INS-AUD-${randomUUID().slice(0, 12).toUpperCase()}`, articleId, operator, action, note, at);
  }
}
