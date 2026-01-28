/**
 * Script para crear el primer usuario administrador.
 *
 * Uso:
 * 1. Crea el usuario en Firebase Auth (email/contraseña) y anota el UID.
 * 2. Define en .env o .env.local:
 *    ADMIN_EMAIL=admin@example.com
 *    ADMIN_NAME=Administrador
 *    ADMIN_FIREBASE_UID=<uid de Firebase>
 * 3. Ejecuta: npm run seed:admin
 *
 * Si el email o firebase_uid ya existen, el script no hace nada.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

function loadEnv(): void {
  const roots = [process.cwd(), join(process.cwd(), '..')];
  const files = ['.env.local', '.env'];
  for (const root of roots) {
    for (const f of files) {
      const p = join(root, f);
      if (existsSync(p)) {
        const buf = readFileSync(p, 'utf-8');
        for (const line of buf.split('\n')) {
          const m = line.match(/^\s*([^#=]+)=(.*)$/);
          if (m) {
            const key = m[1].trim();
            const val = m[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    }
  }
}

async function run(): Promise<void> {
  loadEnv();

  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME || 'Administrador';
  const firebaseUid = process.env.ADMIN_FIREBASE_UID;

  if (!email || !firebaseUid) {
    console.error(
      'Faltan ADMIN_EMAIL y/o ADMIN_FIREBASE_UID en .env o .env.local',
    );
    console.error(
      'Crea el usuario en Firebase Auth y define estas variables antes de ejecutar.',
    );
    process.exit(1);
  }

  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'metas_app_db',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();

  try {
    const exists = await client.query(
      `SELECT 1 FROM users WHERE email = $1 OR firebase_uid = $2`,
      [email, firebaseUid],
    );
    if ((exists.rowCount ?? 0) > 0) {
      console.log('Ya existe un usuario con ese email o firebase_uid. Nada que hacer.');
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    await client.query(
      `INSERT INTO users (id, name, email, firebase_uid, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'admin', $5::timestamptz, $6::timestamptz)`,
      [id, name, email, firebaseUid, now, now],
    );
    console.log('Usuario administrador creado:', email);
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
