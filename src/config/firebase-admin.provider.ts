import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/**
 * Proveedor de Firebase Admin SDK
 * Inicializa y proporciona una instancia única de Firebase Admin
 */
@Injectable()
export class FirebaseAdminProvider implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  /**
   * Inicializa Firebase Admin SDK al iniciar el módulo
   */
  onModuleInit() {
    const firebaseConfig = this.configService.get('firebase');

    if (
      !firebaseConfig.projectId ||
      !firebaseConfig.privateKey ||
      !firebaseConfig.clientEmail
    ) {
      throw new Error(
        'Firebase configuration is missing. Please check your environment variables.',
      );
    }

    try {
      // Verificar si ya existe una app de Firebase
      this.app = admin.apps.length
        ? admin.app()
        : admin.initializeApp({
            credential: admin.credential.cert({
              projectId: firebaseConfig.projectId,
              privateKey: firebaseConfig.privateKey,
              clientEmail: firebaseConfig.clientEmail,
            }),
          });
    } catch (error) {
      throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
  }

  /**
   * Obtiene la instancia de Firebase Admin
   * @returns Instancia de Firebase Admin App
   */
  getAdmin(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase Admin not initialized');
    }
    return this.app;
  }

  /**
   * Obtiene el servicio de autenticación de Firebase
   * @returns Firebase Auth service
   */
  getAuth(): admin.auth.Auth {
    return this.getAdmin().auth();
  }
}
