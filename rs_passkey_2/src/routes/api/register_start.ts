import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/api/register_start')({
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
        const data = {
          username: username , display_name: username, 
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/register/start', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify(data) // データをJSON文字列に変換
        });

        // レスポンスのステータスコードを確認
        if (!response.ok) {
          return Response.json({
            success: false,
            message: `HTTPエラー! ステータス: ${response.status}`,
            data: body,
          })          
        }
        const result = await response.json();
        console.log('成功:', result);

        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: result,
        })
      },

    },
  },
})