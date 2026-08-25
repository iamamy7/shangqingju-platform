import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly connection: DatabaseSync;

  constructor() {
    const runtimeDir = join(process.cwd(), "runtime-data");
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
    `);
  }

  onModuleDestroy() {
    this.connection.close();
  }
}
