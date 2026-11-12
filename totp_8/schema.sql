CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,                       -- AES-256-GCM で暗号化して保存
  totp_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- セッション用テーブル(session)は connect-pg-simple が自動作成します
CREATE TABLE IF NOT EXISTS mail_users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_otps (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL,
  otp_hash   TEXT NOT NULL,              -- bcrypt でハッシュ化した OTP
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INT NOT NULL DEFAULT 0,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps (email, created_at DESC);
