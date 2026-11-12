import { createFileRoute } from '@tanstack/react-router'
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import totp from '../../lib/totp';
import Config from '../../config'
import Mailer from '../../lib/mailer';
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 10;
const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES || 5) * 60 * 1000;
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60) * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const isValidEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// 暗号論的に安全な6桁コード（先頭ゼロあり）
const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
// ---------- ユーティリティ ----------
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const Route = createFileRoute('/api/otp_mail_verify')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        console.log("#otp_mail_verify")
        const body = await request.json()
        const otp = String(body.otp || '').trim();
        console.log(body)
        const userId = body.userId;
        const code = typeof body?.code === 'string' ? body.code.trim() : '';
        const email = normalizeEmail(body.email);
        if (!EMAIL_RE.test(email)) {
          return Response.json({
            success: false,
            message: "メールアドレスの形式が正しくありません。",
            data: {},
          })            
        }
        const client = await pool.connect();

        try {
          await client.query('BEGIN');

          // 最新の未使用 OTP をロックして取得
          const { rows } = await client.query(
            `SELECT * FROM email_otps
            WHERE email = $1 AND used = FALSE
            ORDER BY created_at DESC LIMIT 1
            FOR UPDATE`,
            [email]
          );
          const record = rows[0];
          console.log("#record")
          console.log(record)

          if (!record || new Date(record.expires_at) < new Date()) {
            await client.query('COMMIT');
            return Response.json({
              success: false,
              message: "コードが無効または期限切れです。再送してください。",
              data: {},
            })             
          }

          if (record.attempts >= MAX_ATTEMPTS) {
            await client.query(`UPDATE email_otps SET used = TRUE WHERE id = $1`, [record.id]);
            await client.query('COMMIT');
            return Response.json({
              success: false,
              message: "試行回数の上限に達しました。再送してください。",
              data: {},
            })             
          }

          const ok = await bcrypt.compare(otp, record.otp_hash);
          if (!ok) {
            await client.query(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1`, [record.id]);
            await client.query('COMMIT');
            return Response.json({
              success: false,
              message: "コードが正しくありません。",
              data: {},
            })            
          }

          // 成功: OTP を使用済みに + ユーザーを作成/取得
          await client.query(`UPDATE email_otps SET used = TRUE WHERE id = $1`, [record.id]);
          const userRes = await client.query(
            `INSERT INTO mail_users (email) VALUES ($1)
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING id, email`,
            [email]
          );
          await client.query('COMMIT');

          const user = userRes.rows[0];
        } catch (error) {
          await client.query('ROLLBACK').catch(() => {});
          console.error(error);
          return Response.json({
            success: false,
            message: "",
            data: {},
          })             
        } finally {
          client.release();
        }        
        return Response.json({
          success: true,
          message: 'OK',
          data: {},
        });
      },
    },
  },
})
