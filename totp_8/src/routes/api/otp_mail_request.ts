import { createFileRoute } from '@tanstack/react-router'
//import { db } from "../../db";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import totp from '../../lib/totp';
import Config from '../../config'
//import LibCrypto from '../../lib/crypto';
import Mailer from '../../lib/mailer';
//import { sendOtpMail } from './mailer.js';

const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';
const EXPIRE_MIN = Number(process.env.OTP_EXPIRE_MINUTES || 5);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const COOLDOWN_SEC = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60);

const BCRYPT_ROUNDS = 10;
const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES || 5) * 60 * 1000;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60) * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getUser = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);
const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const isValidEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// 暗号論的に安全な6桁コード（先頭ゼロあり）
const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const Route = createFileRoute('/api/otp_mail_request')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const userId = body.userId;
        const email = normalizeEmail(body.email);
        if (!EMAIL_RE.test(email)) {
          return Response.json({
            success: fasle,
            message: 'メールアドレスの形式が正しくありません。',
            data: {},
          })
        }
        try {
        // 再送クールダウン
          const { rows } = await pool.query(
            `SELECT created_at FROM email_otps
            WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
            [email]
          );
          console.log("#rows")
          console.log(rows[0])
          if (rows[0]) {
            const elapsed = (Date.now() - new Date(rows[0].created_at).getTime()) / 1000;
            if (elapsed < COOLDOWN_SEC) {
              //return res.status(429).json({
              //  error: `再送は ${Math.ceil(COOLDOWN_SEC - elapsed)} 秒後に可能です。`,
              //});
              return Response.json({
                success: fasle,
                message: '再送は ${Math.ceil(COOLDOWN_SEC - elapsed)} 秒後に可能です。',
                data: {},
              })              
            }
          }     
          const otp = generateOtp();
          const otpHash = await bcrypt.hash(otp, 10);

          // 古い未使用 OTP を無効化して新規登録
          await pool.query(`UPDATE email_otps SET used = TRUE WHERE email = $1 AND used = FALSE`, [email]);
          await pool.query(
            `INSERT INTO email_otps (email, otp_hash, expires_at)
            VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
            [email, otpHash, String(EXPIRE_MIN)]
          );

          await Mailer.sendOtpMail(email, otp);               
               
          return Response.json({
            success: true,
            message: 'OK',
            data: {},
          })
        } catch (error) {
          console.error(error);
        }        
        return Response.json({
          success: false,
          message: '',
          data: {},
        })
      },

    },
  },
})
