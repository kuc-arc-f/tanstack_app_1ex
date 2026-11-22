import { createFileRoute } from '@tanstack/react-router'
import crypto from 'node:crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../config'

const PORT = process.env.PORT || 3000;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;

export const Route = createFileRoute('/api/register_finish')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        const body = await request.json()
        console.log(body)
        const username = body.username;
        //const data = {
        //  username: username 
        //}
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/register/finish', {
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
            message: 'error, response.ok = NG',
            data: {},
          })
        }
        const result = await response.json();
        console.log('成功:', result);

        return Response.json({
          success: true,
          message: '',
          data: body,
        })
      },

    },
  },
})