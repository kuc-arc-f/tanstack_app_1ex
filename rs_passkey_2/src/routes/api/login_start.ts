import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

export const Route = createFileRoute('/api/login_start')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        console.log("#login_start")
        let allowCredentials

        const body = await request.json()
        console.log(body)
        const username = body.username;
        if (!/^[\w.@-]{3,64}$/.test(username)) {
          return Response.json({
            success: false,
            message: 'username は 3〜64 文字です',
            data: body,
          })
        }
        const data = {
          username: username 
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/login/start', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify(data) // データをJSON文字列に変換
        });

        // レスポンスのステータスコードを確認
        if (!response.ok) {
          console.log(`HTTPエラー! ステータス: ${response.status}`);
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
          message: 'LOGIN OK',
          data: result,
        })

      },

    },
  },
})