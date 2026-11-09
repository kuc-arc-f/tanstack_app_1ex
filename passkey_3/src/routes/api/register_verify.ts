import { createFileRoute } from '@tanstack/react-router'
import { db, q } from "../../db";
import bcrypt from 'bcryptjs';
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

export const Route = createFileRoute('/api/register_verify')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {
        const body = await request.json()
        console.log(body)
        const username = body.username;
        let userId = body.userId;
        const filePath = path.join(process.cwd(), Config.SESSION_DIR , `session-${body.userId}.json`);
        try {
          const sessionData = await fs.readFile(filePath, 'utf8');
          const json1 = JSON.parse(sessionData)
          console.log(json1);

          const v = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: json1.challenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: true,
          });
          if (!v.verified){
            return Response.json({
              success: false,
              message: 'error, 検証に失敗しました',
              data: body,
            })
          } 
          const { credential, credentialDeviceType, credentialBackedUp } = v.registrationInfo;
          db.transaction(() => {
            if (json1.isNew) q.insertUser.run(json1.userId, json1.username);
            q.insertCred.run({
              id: credential.id,
              user_id: json1.userId,
              public_key: Buffer.from(credential.publicKey),
              counter: credential.counter,
              transports: JSON.stringify(credential.transports || []),
              device_type: credentialDeviceType,
              backed_up: credentialBackedUp ? 1 : 0,
            });
          })();
        } catch (err) {
          console.error('エラーが発生しました:', err);
            return Response.json({
              success: false,
              message: err,
              data: body,
            })          
        }
        return Response.json({
          success: true,
          message: '',
          data: body,
        })
      },

    },
  },
})