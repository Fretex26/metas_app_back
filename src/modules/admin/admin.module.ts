import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './presentation/admin.controller';
import { SponsorOrmEntity } from '../sponsors/infrastructure/persistence/sponsor.orm-entity';
import { AdminRepositoryImpl } from './infrastructure/persistence/admin.repository.impl';
import type { IAdminRepository } from './domain/repositories/admin.repository';
import { GetPendingSponsorsUseCase } from './application/use-cases/get-pending-sponsors.use-case';
import { ListAllSponsorsUseCase } from './application/use-cases/list-all-sponsors.use-case';
import { GetSponsorDetailsUseCase } from './application/use-cases/get-sponsor-details.use-case';
import { ApproveSponsorUseCase } from './application/use-cases/approve-sponsor.use-case';
import { RejectSponsorUseCase } from './application/use-cases/reject-sponsor.use-case';
import { DisableSponsorUseCase } from './application/use-cases/disable-sponsor.use-case';
import { EnableSponsorUseCase } from './application/use-cases/enable-sponsor.use-case';
import { UsersModule } from '../users/users.module';

/**
 * Módulo de administración
 * 
 * Proporciona funcionalidades para gestión administrativa:
 * - Aprobar/rechazar sponsors
 * - Habilitar/deshabilitar sponsors
 * - Listar y consultar sponsors
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SponsorOrmEntity]),
    UsersModule, // Para usar el repositorio de usuarios
  ],
  controllers: [AdminController],
  providers: [
    // Repositorio
    {
      provide: 'IAdminRepository',
      useClass: AdminRepositoryImpl,
    },
    // Use cases
    GetPendingSponsorsUseCase,
    ListAllSponsorsUseCase,
    GetSponsorDetailsUseCase,
    ApproveSponsorUseCase,
    RejectSponsorUseCase,
    DisableSponsorUseCase,
    EnableSponsorUseCase,
  ],
  exports: ['IAdminRepository'],
})
export class AdminModule {}
