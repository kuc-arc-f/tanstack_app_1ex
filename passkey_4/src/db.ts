import 'dotenv/config'
import { Pool } from 'pg';

//module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
