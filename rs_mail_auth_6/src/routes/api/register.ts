import { createFileRoute } from '@tanstack/react-router'
import Config from "../../config";

export const Route = createFileRoute('/api/register')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        const username = body.username;
        const password = body.password;
        console.log(body);
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
        // 送信したいデータ
        const data = {
          email: username,
          password: password
        };
        try {
          console.log("url=", Config.EXTERNAL_API_URL)
          const response = await fetch(Config.EXTERNAL_API_URL + '/auth/user_register', {
            method: 'POST', // リクエストメソッドを指定
            headers: {
              'Content-Type': 'application/json' // JSONを送ることを伝える
            },
            body: JSON.stringify(data) // データをJSON文字列に変換
          });
          if (!response.ok) {
            throw new Error(`HTTPエラー! ステータス: ${response.status}`);
          }
          // 返ってきたJSONデータを解析
          const result = await response.json();
          console.log('成功:', result);
          return Response.json({
            success: true,
            message: 'INSERT OK',
            data: body,
          })          
        } catch (error) {
          console.error('エラーが発生しました:', error);
          return Response.json({
            success: false,
            message: 'エラーが発生しました:' + error,
            data: body,
          })          
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