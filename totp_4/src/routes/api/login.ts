import { createFileRoute } from '@tanstack/react-router'
import { db } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export const Route = createFileRoute('/api/login')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
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
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
        if (!user || !ok) {
          if (user) lock.recordFailure(user.id);
          return Response.json({
            success: false,
            message: 'error, ID , password NG',
            data: body,
          })
        }
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${user.id}.json`);
        console.log("filePath=", filePath)
        try {
          const userData = {
            pending: { userId: user.id }
          };            
          await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
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
          message: 'LOGIN OK',
          data: body,
        })
      },

    },
  },
})