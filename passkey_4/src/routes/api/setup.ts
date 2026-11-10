import { createFileRoute } from '@tanstack/react-router'
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
//import QRCode from 'qrcode';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
//import totp from '../../lib/totp';
import LibCrypto from '../../lib/crypto';
import { authenticator } from 'otplib';

const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const Route = createFileRoute('/api/setup')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const userId = body.userId;
        try {
/*
          const { rows } = await pool.query(
            'SELECT email, totp_enabled FROM users WHERE id = $1',
             [userId]
          );
          if (!rows[0]) {
            return Response.json({
              success: false,
              message: '認証できません',
              data: {},
            })
          }
          const user = rows[0];
          console.log(user)
          const secret = totp.generateSecret();
          console.log("secret=", secret)
          try {
            await pool.query('UPDATE users SET totp_secret = $1 WHERE id = $2', [
              LibCrypto.encrypt(secret),
              userId,
            ]);
          } catch (e) {
            console.error(e);
            return Response.json({
              success: false,
              message: 'サーバーエラー',
              data: {},
            })

          }
          const otpauth = authenticator.keyuri(rows[0].email, process.env.APP_NAME || 'MyWebApp', secret);
          const qr = await QRCode.toDataURL(otpauth);
*/
          return Response.json({
            success: true,
            message: 'OK',
            data: {qrDataUrl: qr, manualKey: secret},
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
