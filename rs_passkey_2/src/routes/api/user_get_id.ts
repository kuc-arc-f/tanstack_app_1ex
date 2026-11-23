import { createFileRoute } from '@tanstack/react-router'
//import { pool } from "../../db";
//import bcrypt from 'bcryptjs';
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
        const email = body.username;
        if(!email){
          console.log("error, email = NONE")
          return Response.json({
            success: false,
            message: 'error, email = NONE',
            data: {},
          })
        }
        const data = {
          email: email, 
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
          return Response.json({
            success: false,
            message: `HTTPエラー! ステータス: ${response.status}`,
            data: body,
          })          
        }
        const result = await response.json();
        console.log('成功:', result);
        const user = {id: result.id};
        if(!user.id || user.id === 0){
          return Response.json({
            success: false,
            message: 'error, user.id = NONE',
            data: body,
          })
        }        

        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: result,
        })
      },

    },
  },
})