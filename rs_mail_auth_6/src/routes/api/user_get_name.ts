import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export const Route = createFileRoute('/api/user_get_name')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        //const userId = body.user_id;
        const email = body.username;
        if(!email){
          console.log("error, email = NONE")
          return Response.json({
            success: false,
            message: 'error, email = NONE',
            data: {},
          })
        }
        // 送信したいデータ
        const data = {
          email: email,
        };
        try {
          console.log("url=", Config.EXTERNAL_API_URL)
          const response = await fetch(Config.EXTERNAL_API_URL + '/auth/user_get_name', {
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
            data: result,
          })          
        } catch (error) {
          console.error('エラーが発生しました:', error);
          return Response.json({
            success: false,
            message: 'エラーが発生しました:'+ error,
            data: body,
          })          
        }        
        return Response.json({
          success: true,
          message: '',
          data: {},
        })
      },

    },
  },
})