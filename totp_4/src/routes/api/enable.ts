import { createFileRoute } from '@tanstack/react-router'
import { db } from "../../db";
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
import totp from '../../lib/totp';
import LibCrypto from '../../lib/crypto';
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const Route = createFileRoute('/api/enable')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const userId = body.userId;
        const token = body.token;
        try {
          const user = getUser(userId);
          console.log(user)
          const step = totp.verifyToken(String(token || '').trim(), LibCrypto.decrypt(user.totp_secret_enc));
          if (step === null) {
            return Response.json({
                success: false,
                message: 'error , code =NG',
                data: {},
              })
          }
          const codes = LibCrypto.generateRecoveryCodes(8);
          const tx = db.transaction(() => {
            db.prepare('UPDATE users SET totp_enabled = 1, totp_last_used_step = ? WHERE id = ?')
              .run(step, user.id);
            db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(user.id);
            const ins = db.prepare('INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)');
            codes.forEach((c) => ins.run(user.id, LibCrypto.sha256(c)));
          });
          tx()   
          
          return Response.json({
            success: true,
            message: 'OK',
            data: {recoveryCodes: codes},
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
