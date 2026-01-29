import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { FirebaseAdminModule } from './config/firebase-admin.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DailyEntriesModule } from './modules/daily-entries/daily-entries.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RetrospectivesModule } from './modules/retrospectives/retrospectives.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { SponsoredGoalsModule } from './modules/sponsored-goals/sponsored-goals.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { SponsorStatusGuardModule } from './shared/sponsor-status-guard.module';

/**
 * Módulo principal de la aplicación
 *
 * Configura los módulos globales necesarios:
 * - ConfigModule: Gestión de variables de entorno
 * - TypeOrmModule: Conexión a PostgreSQL
 * - FirebaseAdminModule: Firebase Admin SDK
 */
@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),

    // Módulo de Firebase Admin SDK
    FirebaseAdminModule,

    // Módulos de la aplicación
    UsersModule,
    AdminModule,
    ProjectsModule,
    MilestonesModule,
    SprintsModule,
    TasksModule,
    DailyEntriesModule,
    ReviewsModule,
    RetrospectivesModule,
    SponsorsModule,
    SponsoredGoalsModule,
    CategoriesModule,
    GamificationModule,
    StatisticsModule,
    AuditModule,
    AuthModule,
    SponsorStatusGuardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
