import { createFileRoute } from '@tanstack/react-router'
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
        const data = {
          email: username , password: password, 
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/login', {
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
            message: 'error, response.ok = NG',
            data: {},
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