import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

const regenerate = (req) => new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));

export const Route = createFileRoute('/api/login')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
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