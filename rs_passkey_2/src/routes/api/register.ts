import { createFileRoute } from '@tanstack/react-router'
import Config from "../../config";

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
        const data = {
          email: email , password: password, 
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/signup', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify(data) // データをJSON文字列に変換
        });

        // レスポンスのステータスコードを確認
        if (!response.ok) {
          throw new Error(`HTTPエラー! ステータス: ${response.status}`);
        }
        const result = await response.json();
        console.log('成功:', result);        
        return Response.json({
          success: true,
          message: 'INSERT OK',
          data: body,
        })
      },

    },
  },
})