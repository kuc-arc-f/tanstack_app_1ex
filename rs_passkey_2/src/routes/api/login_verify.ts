import { createFileRoute } from '@tanstack/react-router'
//import { db , q } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import pg from 'pg';
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
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

export const Route = createFileRoute('/api/login_verify')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        console.log("#login_verify");
        const body = await request.json()
        console.log("#body");
        console.log(body)
        const username = body.username;
        const password = body.password;
        let expectedChallenge = null;

        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        //let challengeVal = null
        let rowData = null
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log("#json1");
          console.log(json1);
          expectedChallenge = json1.authChallenge;
          console.log("expectedChallenge=", expectedChallenge);
          if (!expectedChallenge) {
            return Response.json({
              success: false,
              message: 'error, session none , authChallenge',
              data: body,
            })          
          }
          const { rows } = await pool.query(
            `select c.id, c.user_id, c.public_key, c.counter, c.transports, u.username
              from credentials c join passkey_users u on u.id = c.user_id
              where c.id = $1`,
            [body.id],
          );
          const row = rows[0];
          rowData = row
          console.log("#row");
          console.log(row);          
          if (!row) {
            return Response.json({
              success: false,
              message: 'error, 登録されていない Passkey です。',
              data: body,
            })          
          } 
        } catch (error) {
          console.error(error);
          return Response.json({
            success: false,
            message: error,
            data: body,
          })          
        }   
        let verification;
        try{   
          verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
            credential: {
              id: rowData.id,
              publicKey: new Uint8Array(rowData.public_key),
              counter: Number(rowData.counter),
              transports: rowData.transports ?? undefined,
            },
          }); 
        } catch (err) {
          console.error(err);
          return Response.json({
            success: false,
            message: '認証に失敗しました。',
            data: body,
          })          
        }

        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: {},
        })
      }

    },
  },
})