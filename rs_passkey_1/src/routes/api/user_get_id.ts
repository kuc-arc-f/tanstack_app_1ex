import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export const Route = createFileRoute('/api/user_get_id')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const username = body.username;
        if(!username){
          console.log("error, email = NONE")
          return Response.json({
            success: false,
            message: 'error, email = NONE',
            data: {},
          })
        }
        const data = {
          email: username
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/user_get_id', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify(data) // データをJSON文字列に変換
        });

        // レスポンスのステータスコードを確認
        if (!response.ok) {
          //throw new Error(`HTTPエラー! ステータス: ${response.status}`);
          return Response.json({
            success: false,
            message: 'response.ok = NG',
            data: {},
          })
        }
        const result = await response.json();
        console.log('成功:', result);
        return Response.json({
          success: true,
          message: 'OK',
          data: result,
        })
      },

    },
  },
})