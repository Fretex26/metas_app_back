import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAdminProvider } from './firebase-admin.provider';
import firebaseConfig from './firebase.config';

/**
 * Módulo global de Firebase Admin SDK
 * Proporciona una instancia única de Firebase Admin para toda la aplicación
 */
@Global()
@Module({
  imports: [ConfigModule.forFeature(firebaseConfig)],
  providers: [FirebaseAdminProvider],
  exports: [FirebaseAdminProvider],
})
export class FirebaseAdminModule {}
