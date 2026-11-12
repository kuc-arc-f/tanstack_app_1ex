import { createFileRoute } from '@tanstack/react-router'
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
//import totp from '../../lib/totp';
import LibCrypto from '../../lib/crypto';
const ISSUER = process.env.TOTP_ISSUER || 'MyWebApp';
import { authenticator } from 'otplib';

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
          /*
          const { rows } = await pool.query(
            'SELECT email, totp_enabled, totp_secret FROM users WHERE id = $1',
             [userId]
          );
          if (!rows[0]) {
            return Response.json({
              success: false,
              message: '認証できません',
              data: {},
            })
          }       
          const user = rows[0]   
          console.log(user)
          const secret = user.totp_secret;
          const totp_secret = LibCrypto.decrypt(user.totp_secret );
          console.log("totp_secret", totp_secret)
          */
         /*
          const step = totp.verifyToken(String(token || '').trim(), LibCrypto.decrypt(user.totp_secret ));
          if (step === null) {
            return Response.json({
                success: false,
                message: 'error , code =NG',
                data: {},
              })
          }          
         */
          
          return Response.json({
            success: true,
            message: 'OK',
            data: {recoveryCodes: ""},
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
