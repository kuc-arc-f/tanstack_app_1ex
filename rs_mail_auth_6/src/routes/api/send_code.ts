import { createFileRoute } from '@tanstack/react-router'
//import { db } from "../../db";
//import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
//import totp from '../../lib/totp';
import Config from '../../config'
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const BCRYPT_ROUNDS = 10;
const OTP_TTL_MS = Number(process.env.OTP_TTL_MINUTES || 5) * 60 * 1000;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_COOLDOWN_MS = Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60) * 1000;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');
const isValidEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// 暗号論的に安全な6桁コード（先頭ゼロあり）
const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const Route = createFileRoute('/api/send_code')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const userId = body.userId;
        const email = body.email;
        if (!isValidEmail(email)) {
          return Response.json({
            success: fasle,
            message: 'メールアドレスの形式が正しくありません。',
            data: {},
          })
        }
        const data = {
          "email":email, "password":"",
        };
        try {
          console.log("url=", Config.EXTERNAL_API_URL)
          const response = await fetch(Config.EXTERNAL_API_URL + '/auth/send_code', {
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
            data: result,
          })          
        } catch (error) {
          console.error('エラーが発生しました:', error);
          return Response.json({
            success: false,
            message: 'エラーが発生しました:'+ error,
            data: body,
          })          
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
