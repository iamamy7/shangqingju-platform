"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_sqlite_1 = require("node:sqlite");
let DatabaseService = class DatabaseService {
    connection;
    constructor() {
        const runtimeDir = (0, node_path_1.join)(process.cwd(), "runtime-data");
        (0, node_fs_1.mkdirSync)(runtimeDir, { recursive: true });
        this.connection = new node_sqlite_1.DatabaseSync((0, node_path_1.join)(runtimeDir, "shangqingju.sqlite"));
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
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseService);
