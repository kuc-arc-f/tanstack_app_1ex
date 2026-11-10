import { createFileRoute } from '@tanstack/react-router'
//import { db } from "../../db";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export const Route = createFileRoute('/api/user_get_name')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const userId = body.userId;
        if(!userId){
          console.log("error, email = NONE")
          return Response.json({
            success: false,
            message: 'error, email = NONE',
            data: {},
          })
        }
        const { rows } = await pool.query(
          'SELECT email, totp_enabled FROM users WHERE id = $1',
            [userId]
        );
        const user = rows[0]        
        return Response.json({
          success: true,
          message: '',
          data: user,
        })
      },

    },
  },
})