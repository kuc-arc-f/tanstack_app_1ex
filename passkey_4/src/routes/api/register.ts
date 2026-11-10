import { createFileRoute } from '@tanstack/react-router'
import { pool } from "../../db";
//const pool = require('./db');
import bcrypt from 'bcryptjs';

export const Route = createFileRoute('/api/register')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        const email = body.username;
        const password = body.password;
        if (typeof email !== 'string' || email.length < 3 || email.length > 64) {
          return Response.json({
            success: false,
            message: 'email は 3〜64 文字です',
            data: body,
          })
        }
        if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
          return Response.json({
            success: false,
            message: 'password は 6〜128 文字です',
            data: body,
          })
        }
        try {
          const hash = await bcrypt.hash(password, 12);
          await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)',
             [email.toLowerCase(), hash]
          );
          return Response.json({
            success: true,
            message: 'OK',
            data: body,
          })
        } catch (e) {
          if (e.code === '23505') {
            return Response.json({
              success: false,
              message: '登録済みのメールアドレスです',
              data: body,
            })

          }
          console.error(e);
        }          

        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: body,
        })
      },

    },
  },
})