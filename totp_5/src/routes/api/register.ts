import { createFileRoute } from '@tanstack/react-router'
import { db } from "../../db";
import bcrypt from 'bcryptjs';

export const Route = createFileRoute('/api/register')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        const username = body.username;
        const password = body.password;
        if (typeof username !== 'string' || username.length < 3 || username.length > 64) {
          return Response.json({
            success: false,
            message: 'username は 3〜64 文字です',
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
        db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
          .run(username, bcrypt.hashSync(password, 12));

        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: body,
        })
      },

    },
  },
})