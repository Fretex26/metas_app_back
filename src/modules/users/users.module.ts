import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/users.controller';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { IUserRepository } from './domain/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { CategoriesModule } from '../categories/categories.module';

/**
 * Módulo de usuarios
 * 
 * Proporciona funcionalidades para gestión de usuarios:
 * - Crear usuarios
 * - Obtener perfil
 * - Actualizar perfil
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    CategoriesModule,
  ],
  controllers: [UsersController],
  providers: [
    // Repositorio
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    // Use cases
    CreateUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
  ],
  exports: [
    'IUserRepository', // Exportar para usar en otros módulos
    TypeOrmModule, // Exportar TypeOrmModule para que otros módulos puedan usar UserOrmEntity
  ],
})
export class UsersModule {}
