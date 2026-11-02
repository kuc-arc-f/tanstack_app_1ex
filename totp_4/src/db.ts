import Database from 'better-sqlite3';
import path from 'path';

//const db = new Database(process.env.DB_PATH || path.join(__dirname, '..', 'app.db'));
export const db = new Database(process.env.DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  username            TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  totp_secret_enc     TEXT,                       -- AES-256-GCM で暗号化した secret
  totp_enabled        INTEGER NOT NULL DEFAULT 0, -- 登録完了(検証成功)後に 1
  totp_last_used_step INTEGER NOT NULL DEFAULT 0, -- リプレイ対策
  failed_count        INTEGER NOT NULL DEFAULT 0, -- 連続失敗回数
  locked_until        INTEGER NOT NULL DEFAULT 0, -- ロック解除時刻 (ms)
  created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS recovery_codes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,                      -- SHA-256 ハッシュ
  used_at    INTEGER,
  UNIQUE(user_id, code_hash)
);
`);

//module.exports = db;
