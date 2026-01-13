import { registerAs } from '@nestjs/config';

/**
 * Configuración de Firebase Admin SDK
 * @returns Objeto con la configuración de Firebase
 */
export default registerAs('firebase', () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}));
