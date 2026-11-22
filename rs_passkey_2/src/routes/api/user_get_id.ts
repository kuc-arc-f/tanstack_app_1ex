import { createFileRoute } from '@tanstack/react-router'
//import { db } from "../../db";
import { pool } from "../../db";
import bcrypt from 'bcryptjs';
import Config from '../../config'
import path from 'path';
import { promises as fs } from 'fs';

export const Route = createFileRoute('/api/user_get_id')({
  server: {
    handlers: {

      // POST
      POST: async ({ request }) => {

        const body = await request.json()
        console.log(body)
        const email = body.username;
        if(!email){
          console.log("error, email = NONE")
          return Response.json({
            success: false,
            message: 'error, email = NONE',
            data: {},
          })
        }
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log(rows[0]);

        return Response.json({
          success: true,
          message: 'LOGIN OK',
          data: rows[0],
        })
      },

    },
  },
})