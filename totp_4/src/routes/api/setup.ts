import { createFileRoute } from '@tanstack/react-router'
import { db } from "../../db";
import bcrypt from 'bcryptjs';
//const QRCode = require('qrcode');
import QRCode from 'qrcode';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
import totp from '../../lib/totp';
import LibCrypto from '../../lib/crypto';
//const { encrypt, decrypt, sha256, generateRecoveryCodes } = require('./crypto');
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const Route = createFileRoute('/api/setup')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        //userId
        const userId = body.userId;
        try {
          const user = getUser(userId);
          console.log(user)
          //if (user.totp_enabled) {            
          //}return res.status(400).json({ error: 'すでに有効です' });
          const secret = totp.generateSecret();
          db.prepare('UPDATE users SET totp_secret_enc = ? WHERE id = ?')
            .run(LibCrypto.encrypt(secret), userId);

          const uri = totp.keyuri(user.username, ISSUER, secret);
          const qrDataUrl = await QRCode.toDataURL(uri);
          // 手入力用に secret も返す (この 1 回のみ)
          return Response.json({
            success: true,
            message: 'OK',
            data: {qrDataUrl, manualKey: secret},
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
