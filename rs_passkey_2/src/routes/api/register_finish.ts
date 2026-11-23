import { createFileRoute } from '@tanstack/react-router'
import crypto from 'node:crypto';
import path from 'path';
import { promises as fs } from 'fs';
import Config from '../../config'
const {
  DATABASE_URL,
  SESSION_SECRET,
  PLATFORM_ONLY = 'true',
  NODE_ENV,
} = process.env;

export const Route = createFileRoute('/api/register_finish')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        const body = await request.json()
        console.log(body)
        let verification;
        let expectedChallenge = null
        let jsonData = null;
        let username = body.username;
        //const data = {
        //  username: username , display_name: username, 
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
            message: `HTTPエラー! ステータス: ${response.status}`,
            data: body,
          })          
        }
        const result = await response.json();
        console.log('成功:', result);        
        /*
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);
          jsonData = json1;
          expectedChallenge = json1.challenge
          verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
          });
        } catch (err) {
          console.error(err);
          return Response.json({
            success: false,
            message: 'error, Passkey の検証に失敗しました。',
            data: body,
          })          
        }     
        const client = await pool.connect();
        try {
          const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

          await client.query('begin');
          if (jsonData.isNew) {
            await client.query(
              'insert into passkey_users (id, username) values ($1, $2)'
              , [jsonData.userId, jsonData.username]
            );
          }
          await client.query(
            `insert into credentials (id, user_id, public_key, counter, transports, device_type, backed_up)
            values ($1, $2, $3, $4, $5, $6, $7)`,
            [
              credential.id,
              jsonData.userId,
              Buffer.from(credential.publicKey),
              credential.counter,
              credential.transports ?? null,
              credentialDeviceType,
              credentialBackedUp,
            ],
          );
          await client.query('commit');          
        } catch (err) {
          await client.query('rollback');
          if (err.code === '23505') {
            return Response.json({
              success: false,
              message: 'error , このユーザー名は使用できません。',
              data: body,
            })          
          }
          console.error('エラーが発生しました:', err);
            return Response.json({
              success: false,
              message: err,
              data: body,
            })          
        }
        client.release();
        */

        return Response.json({
          success: true,
          message: '',
          data: result,
        })
      },

    },
  },
})