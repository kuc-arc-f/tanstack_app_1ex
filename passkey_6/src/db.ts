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
CREATE TABLE IF NOT EXISTS passkey_users (
  id          TEXT PRIMARY KEY,          -- WebAuthn user handle (base64url)
  username    TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS credentials (
  id          TEXT PRIMARY KEY,          -- credential ID (base64url)
  user_id     TEXT NOT NULL REFERENCES passkey_users(id) ON DELETE CASCADE,
  public_key  BLOB NOT NULL,
  counter     INTEGER NOT NULL DEFAULT 0,
  transports  TEXT,                      -- JSON 配列
  device_type TEXT,
  backed_up   INTEGER,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mail_user (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  created_at    INTEGER NOT NULL,
  last_login_at INTEGER
);
-- メールアドレスごとに有効なOTPは1件のみ（再送すると上書き）
CREATE TABLE IF NOT EXISTS otps (
  email      TEXT    PRIMARY KEY,
  code_hash  TEXT    NOT NULL,          -- bcrypt ハッシュ（平文は保存しない）
  expires_at INTEGER NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- セッショントークンは SHA-256 ハッシュで保存
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES mail_user(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

`);


export const q = {
  userByName: db.prepare('SELECT * FROM passkey_users WHERE username = ?'),
  userById: db.prepare('SELECT * FROM passkey_users WHERE id = ?'),
  insertUser: db.prepare('INSERT INTO passkey_users (id, username) VALUES (?, ?)'),
  credsByUser: db.prepare('SELECT * FROM credentials WHERE user_id = ?'),
  credById: db.prepare('SELECT * FROM credentials WHERE id = ?'),
  insertCred: db.prepare(
    `INSERT INTO credentials (id, user_id, public_key, counter, transports, device_type, backed_up)
     VALUES (@id, @user_id, @public_key, @counter, @transports, @device_type, @backed_up)`
  ),
  updateCounter: db.prepare('UPDATE credentials SET counter = ? WHERE id = ?'),
};
