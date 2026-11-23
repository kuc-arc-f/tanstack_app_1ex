import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

export const Route = createFileRoute('/api/login_finish')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        let allowCredentials

        const body = await request.json()
        console.log(body)
        //const data = {
        //  username: username 
        //}
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/login/finish', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify(body) // データをJSON文字列に変換
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
          message: 'LOGIN OK',
          data: result,
        })

      },

    },
  },
})