import { createFileRoute } from '@tanstack/react-router'
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

export const Route = createFileRoute('/api/login_start')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        let allowCredentials

        const body = await request.json()
        console.log(body)
        const username = body.username;
        //const password = body.password;
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/login/start', {
          method: 'POST', // リクエストメソッドを指定
          headers: {
            'Content-Type': 'application/json' // JSONを送ることを伝える
          },
          body: JSON.stringify({username: username}) // データをJSON文字列に変換
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
        /*
        const options = await generateAuthenticationOptions({
          rpID: RP_ID,
          userVerification: 'required',
          allowCredentials,
        });
        console.log("#options")
        console.log(options)
        */
        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: result,
        })

      },

    },
  },
})