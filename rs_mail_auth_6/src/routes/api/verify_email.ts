import { createFileRoute } from '@tanstack/react-router'
import { db } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import totp from '../../lib/totp';
import Config from '../../config'
import Mailer from '../../lib/mailer';
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const BCRYPT_ROUNDS = 10;
const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES || 5) * 60 * 1000;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60) * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);
const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const isValidEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// 暗号論的に安全な6桁コード（先頭ゼロあり）
const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
// ---------- ユーティリティ ----------
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

const statement = {
  getOtp: db.prepare('SELECT * FROM otps WHERE email = ?'),
  upsertOtp: db.prepare(`
    INSERT INTO otps (email, code_hash, expires_at, attempts, created_at)
    VALUES (@email, @code_hash, @expires_at, 0, @created_at)
    ON CONFLICT(email) DO UPDATE SET
      code_hash = excluded.code_hash,
      expires_at = excluded.expires_at,
      attempts = 0,
      created_at = excluded.created_at
  `),
  deleteOtp: db.prepare('DELETE FROM otps WHERE email = ?'),
  // 試行回数を先にアトミックに加算（並列リクエストによる総当たりを防ぐ）
  bumpAttempts: db.prepare(
    'UPDATE otps SET attempts = attempts + 1 WHERE email = ? AND attempts < ? AND expires_at > ?'
  ),
  consumeOtp: db.prepare('DELETE FROM otps WHERE email = ? AND code_hash = ?'),

  getUserByEmail: db.prepare('SELECT * FROM mail_user WHERE email = ?'),
  insertUser: db.prepare('INSERT INTO mail_user (email, created_at) VALUES (?, ?)'),
  touchLogin: db.prepare('UPDATE mail_user SET last_login_at = ? WHERE id = ?'),

  insertSession: db.prepare(
    'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  ),
  getSession: db.prepare(`
    SELECT u.id, u.email, u.created_at, u.last_login_at
    FROM sessions s JOIN mail_user u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  purgeOtps: db.prepare('DELETE FROM otps WHERE expires_at < ?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
};

export const Route = createFileRoute('/api/verify_email')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        //const userId = body.userId;
        const email = body.email;
        const code = typeof body?.code === 'string' ? body.code.trim() : '';
        if (!isValidEmail(email)) {
          return Response.json({
            success: false,
            message: `コードが正しくないか、有効期限が切れています。`,
            data: {},
          })            
        };
        try {
          const data = {
            email: email , code: code
          }
          console.log("url=", Config.EXTERNAL_API_URL)
          const response = await fetch(Config.EXTERNAL_API_URL + '/auth/verify-email', {
            method: 'POST', // リクエストメソッドを指定
            headers: {
              'Content-Type': 'application/json' // JSONを送ることを伝える
            },
            body: JSON.stringify(data) // データをJSON文字列に変換
          });
          if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
          }
          // 返ってきたJSONデータを解析
          const result = await response.json();
          console.log('成功:', result);
          return Response.json({
            success: true,
            message: 'INSERT OK',
            data: body,
          })
        } catch (error) {
          console.error(error);
          return Response.json({
            success: false,
            message: "error",
            data: {},
          })             
        }        
        return Response.json({
          success: true,
          message: '',
          data: {},
        });
      },
    },
  },
})
