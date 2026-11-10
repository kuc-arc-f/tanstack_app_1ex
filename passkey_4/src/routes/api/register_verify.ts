import { createFileRoute } from '@tanstack/react-router'
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import path from 'path';
import pg from 'pg';
import { promises as fs } from 'fs';
import Config from '../../config'
const {
  DATABASE_URL,
  SESSION_SECRET,
  PLATFORM_ONLY = 'true',
  NODE_ENV,
} = process.env;

const PORT = process.env.PORT || 3000;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;
const pool = new pg.Pool({ connectionString: DATABASE_URL });

export const Route = createFileRoute('/api/register_verify')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        const body = await request.json()
        console.log(body)
        let verification;
        let expectedChallenge = null
        let jsonData = null;
        let userId = body.userId;
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

        return Response.json({
          success: true,
          message: '',
          data: body,
        })
      },

    },
  },
})