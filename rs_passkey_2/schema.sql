CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret   TEXT,                       -- AES-256-GCM で暗号化して保存
  totp_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- セッション用テーブル(session)は connect-pg-simple が自動作成します

create table if not exists passkey_users (
  id          uuid primary key,
  username    text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists credentials (
  id            text primary key,          -- credential ID (base64url)
  user_id       uuid not null references passkey_users(id) on delete cascade,
  public_key    bytea not null,
  counter       bigint not null default 0,
  transports    text[],
  device_type   text,
  backed_up     boolean,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

create index if not exists credentials_user_id_idx on credentials(user_id);
