import { createFileRoute } from '@tanstack/react-router'
//import { db, q } from "../../db";
//import bcrypt from 'bcryptjs';
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

const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';

export const Route = createFileRoute('/api/register_options')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const username = body.username;
        let userId = body.userId;
        if (!/^[\w.@-]{3,64}$/.test(username)) {
          return Response.json({
            success: false,
            message: 'username は 3〜64 文字です',
            data: body,
          })
        }
        if(!userId){
          return Response.json({
            success: false,
            message: 'error, userId = NONE',
            data: body,
          })
        }
        /*
return Response.json({
  success: true,
  message: 'INSERT OK',
  data: body,
})
        */

        const data = {
          username: username 
        }
        const api_url = Config.EXTERNAL_API_URL
        const response = await fetch(api_url + '/api/register/start', {
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
          message: 'INSERT OK',
          data: result,
        })
      },

    },
  },
})