import { createFileRoute } from '@tanstack/react-router'
import { db , q } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const PORT = process.env.PORT || 3000;
const RP_NAME = 'Passkey Demo';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;

export const Route = createFileRoute('/api/login_verify')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        console.log("#login_verify");
        const body = await request.json()
        console.log(body)
        const username = body.username;
        const password = body.password;

        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);
          const challenge = json1.authChallenge;
          if (!challenge) {
            return Response.json({
              success: false,
              message: 'error, session none , authChallenge',
              data: body,
            })          
          }
          const cred = q.credById.get(body.id);
          if (!cred){
            return Response.json({
              success: false,
              message: 'error, 未登録のパスキーです',
              data: body,
            })          
          } 
          const v = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge: challenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
            credential: {
              id: cred.id,
              publicKey: new Uint8Array(cred.public_key),
              counter: cred.counter,
              transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            },
          });
          if (!v.verified) {
            return Response.json({
              success: false,
              message: 'error, 認証に失敗しました',
              data: body,
            })              
          } 

          q.updateCounter.run(v.authenticationInfo.newCounter, cred.id);

        } catch (error) {
          console.error(error);
          return Response.json({
            success: false,
            message: error,
            data: body,
          })          
        }        
        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: {},
        })
      },

    },
  },
})