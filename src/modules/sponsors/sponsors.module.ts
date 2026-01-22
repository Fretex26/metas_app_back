import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorsController } from './presentation/sponsors.controller';
import { SponsorOrmEntity } from './infrastructure/persistence/sponsor.orm-entity';
import { SponsorRepositoryImpl } from './infrastructure/persistence/sponsor.repository.impl';
import type { ISponsorRepository } from './domain/repositories/sponsor.repository';
import { CreateSponsorUseCase } from './application/use-cases/create-sponsor.use-case';
import { GetSponsorProfileUseCase } from './application/use-cases/get-sponsor-profile.use-case';
import { UpdateSponsorProfileUseCase } from './application/use-cases/update-sponsor-profile.use-case';
import { UsersModule } from '../users/users.module';
import { LoadUserInterceptor } from '../../shared/interceptors/load-user.interceptor';

/**
 * Módulo de sponsors
 * 
 * Proporciona funcionalidades para gestión de perfiles de patrocinadores:
 * - Solicitar ser patrocinador (crear solicitud en estado PENDING)
 * - Obtener perfil de patrocinador
 * - Actualizar perfil de patrocinador (si está APPROVED, vuelve a PENDING)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SponsorOrmEntity]),
    UsersModule,
  ],
  controllers: [SponsorsController],
  providers: [
    // Repositorio
    {
      provide: 'ISponsorRepository',
      useClass: SponsorRepositoryImpl,
    },
    // Interceptor para cargar el usuario completo con su rol
    LoadUserInterceptor,
    // Use cases
    CreateSponsorUseCase,
    GetSponsorProfileUseCase,
    UpdateSponsorProfileUseCase,
  ],
  exports: ['ISponsorRepository'],
})
export class SponsorsModule {}
