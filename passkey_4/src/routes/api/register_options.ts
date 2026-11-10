import { createFileRoute } from '@tanstack/react-router'
//import { db, q } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../config'
const {
  DATABASE_URL,
  SESSION_SECRET,
  PORT = 3000,
  RP_ID = 'localhost',
  RP_NAME = 'Passkey Demo',
  ORIGIN = 'http://localhost:3000',
  PLATFORM_ONLY = 'true',
  NODE_ENV,
} = process.env;

const isProd = NODE_ENV === 'production';
const USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;

// ---------- DB ----------
const pool = new pg.Pool({ connectionString: DATABASE_URL });
//const filePath = path.join(process.cwd(), Config.SESSION_DIR , `schema.sql`);
const filePath = path.join(process.cwd(), `schema.sql`);
const schemaData = await fs.readFile(filePath, 'utf8');
await pool.query(schemaData);

export const Route = createFileRoute('/api/register_options')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const username = body.username;
        let userId = body.userId;
        if (!/^[\w.@-]{3,64}$/.test(username)) {
          return Response.json({
            success: false,
            message: 'username は 3〜64 文字です',
            data: body,
          })
        }
        if(!userId){
          return Response.json({
            success: false,
            message: 'error, userId = NONE',
            data: body,
          })
        }
        if (!USERNAME_RE.test(username)) {
          return Response.json({
            success: false,
            message: 'error, ユーザー名は 3〜32 文字の半角英数字と _ . - が使えます。',
            data: body,
          })
        }      
        const { rows } = await pool.query('select id from passkey_users where username = $1', [username]);
        const existing = rows[0];
        console.log(existing)
        let excludeCredentials = [];
        if (existing) {
          // 既存ユーザーへの追加は本人（ログイン済み）のみ。未ログインでの乗っ取りを防ぐ
          if (userId !== existing.id) {
            return Response.json({
              success: false,
              message: 'error, このユーザー名は使用できません。',
              data: body,
            })            
          }
          userId = existing.id;
          const creds = await pool.query('select id, transports from credentials where user_id = $1', [userId]);
          excludeCredentials = creds.rows.map((c) => ({ id: c.id, transports: c.transports ?? undefined }));
        } else {
          userId = crypto.randomUUID();
        }
        console.log("userId=", userId)
        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: RP_ID,
          userName: username,
          userID: new TextEncoder().encode(userId),
          attestationType: 'none',
          excludeCredentials,
          authenticatorSelection: {
            residentKey: 'required', // Passkey (discoverable credential)
            userVerification: 'required', // Windows Hello の PIN/顔/指紋 を必須に
            ...(PLATFORM_ONLY === 'true' && { authenticatorAttachment: 'platform' }),
          },
        });    
        console.log("#options")    
        console.log(options)    
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);

        try {
          const sessionData = { challenge: options.challenge, userId, username, isNew: !existing }     
          await fs.writeFile(filePath, JSON.stringify(sessionData, null, 2), 'utf-8');
          console.log('ファイルを正常に書き込みました');
        } catch (error) {
          console.error('ファイル書き込みエラー:', error);
          return Response.json({
            success: false,
            message: 'error, login Json file write NG',
            data: body,
          })          
        }         
        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: options,
        })
      },

    },
  },
})