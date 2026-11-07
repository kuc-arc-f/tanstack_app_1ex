CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,                       -- AES-256-GCM で暗号化して保存
  totp_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- セッション用テーブル(session)は connect-pg-simple が自動作成します
