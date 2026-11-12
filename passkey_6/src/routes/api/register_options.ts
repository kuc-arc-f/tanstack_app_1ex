import { createFileRoute } from '@tanstack/react-router'
import { db, q } from "../../db";
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../config'

const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

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
        const existing = q.userByName.get(username);
        console.log(existing)
        let excludeCredentials = [];
        if (existing) {
          // 既存ユーザーへの Passkey 追加は、そのユーザーでログイン済みの場合のみ許可
          if (userId !== existing.id){
            return Response.json({
              success: false,
              message: 'error, このユーザー名は使用されています',
              data: body,
            })
          }
          userId = existing.id;
          excludeCredentials = q.credsByUser.all(userId).map((c) => ({
            id: c.id,
            transports: c.transports ? JSON.parse(c.transports) : undefined,
          }));
        } else {
          userId = crypto.randomBytes(32).toString('base64url');
        }
        const options = await generateRegistrationOptions({
          rpName: RP_NAME,
          rpID: RP_ID,
          userName: username,
          userID: Buffer.from(userId, 'base64url'),
          attestationType: 'none',
          excludeCredentials,
          authenticatorSelection: {
            residentKey: 'required',        // 探索可能な Passkey (ユーザー名入力なしログイン用)
            userVerification: 'required',   // Windows Hello (PIN/顔/指紋) を必須化
          },
        });
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