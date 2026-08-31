import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly connection: DatabaseSync;

  constructor() {
    const runtimeDir = process.env.SQJ_RUNTIME_DIR || join(process.cwd(), "runtime-data");
    mkdirSync(runtimeDir, { recursive: true });
    this.connection = new DatabaseSync(join(runtimeDir, "shangqingju.sqlite"));
    this.connection.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS system_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        local_name TEXT,
        country TEXT NOT NULL,
        registration_number TEXT NOT NULL,
        status TEXT NOT NULL,
        search_text TEXT NOT NULL,
        payload_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS company_modules (
        company_id TEXT NOT NULL,
        module_code TEXT NOT NULL,
        data_state TEXT NOT NULL,
        payload_json TEXT,
        PRIMARY KEY (company_id, module_code),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS accounts (
        owner TEXT PRIMARY KEY,
        balance REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'CNY',
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        company_id TEXT NOT NULL,
        module_codes_json TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        paid_at TEXT,
        task_id TEXT,
        report_id TEXT,
        payment_channel TEXT,
        invoice_requested INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL UNIQUE,
        owner TEXT NOT NULL,
        company_id TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      );
      CREATE TABLE IF NOT EXISTS account_ledger (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        order_id TEXT,
        direction TEXT NOT NULL,
        amount REAL NOT NULL,
        balance_after REAL NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS insight_articles (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        title_zh TEXT NOT NULL,
        summary TEXT NOT NULL,
        summary_zh TEXT NOT NULL,
        source TEXT NOT NULL,
        source_zh TEXT NOT NULL,
        source_url TEXT NOT NULL,
        source_published_at TEXT,
        read_minutes INTEGER NOT NULL DEFAULT 6,
        status TEXT NOT NULL,
        collected_at TEXT NOT NULL,
        reviewed_at TEXT,
        reviewed_by TEXT,
        published_at TEXT,
        rejected_reason TEXT,
        collection_run_id TEXT,
        payload_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS insight_articles_status_published_idx
        ON insight_articles(status, published_at DESC);
      CREATE TABLE IF NOT EXISTS insight_collection_runs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        source_count INTEGER NOT NULL,
        candidate_count INTEGER NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        mode TEXT NOT NULL,
        summary_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS insight_audit_logs (
        id TEXT PRIMARY KEY,
        article_id TEXT,
        operator TEXT NOT NULL,
        action TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS homepage_content (
        content_key TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS company_search_events (
        id TEXT PRIMARY KEY,
        query_text TEXT NOT NULL,
        search_scope TEXT NOT NULL,
        company_id TEXT,
        company_name TEXT,
        match_score REAL,
        queried_at TEXT NOT NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS company_search_events_trending_idx
        ON company_search_events(queried_at DESC, company_id);
    `);
    this.migrateBrandName();
  }

  private migrateBrandName() {
    const migrationKey = "brand_name_shangqingju_to_shangqingju_20260831";
    const migrated = this.connection.prepare("SELECT value FROM system_meta WHERE key = ?").get(migrationKey);
    if (migrated) return;

    this.connection.exec("BEGIN IMMEDIATE");
    try {
      this.connection.exec(`
        UPDATE homepage_content
          SET payload_json = replace(payload_json, '商情局', '商情据')
          WHERE instr(payload_json, '商情局') > 0;
        UPDATE insight_articles SET
          title = replace(title, '商情局', '商情据'),
          title_zh = replace(title_zh, '商情局', '商情据'),
          summary = replace(summary, '商情局', '商情据'),
          summary_zh = replace(summary_zh, '商情局', '商情据'),
          source = replace(source, '商情局', '商情据'),
          source_zh = replace(source_zh, '商情局', '商情据'),
          payload_json = replace(payload_json, '商情局', '商情据')
          WHERE instr(title, '商情局') > 0
             OR instr(title_zh, '商情局') > 0
             OR instr(summary, '商情局') > 0
             OR instr(summary_zh, '商情局') > 0
             OR instr(source, '商情局') > 0
             OR instr(source_zh, '商情局') > 0
             OR instr(payload_json, '商情局') > 0;
        UPDATE insight_audit_logs
          SET note = replace(note, '商情局', '商情据')
          WHERE note IS NOT NULL AND instr(note, '商情局') > 0;
      `);
      this.connection.prepare("INSERT INTO system_meta(key, value) VALUES (?, ?)")
        .run(migrationKey, new Date().toISOString());
      this.connection.exec("COMMIT");
    } catch (error) {
      this.connection.exec("ROLLBACK");
      throw error;
    }
  }

  onModuleDestroy() {
    this.connection.close();
  }
}
