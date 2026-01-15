---
name: Backend NestJS con Firebase - Sistema Completo (Actualizado)
overview: ""
todos: []
---

# Plan de Implementación - Backend NestJS con Firebase (Actualizado)

## Arquitectura General

El proyecto seguirá arquitectura limpia con la siguiente estructura:

```
src/
├── modules/
│   ├── auth/          # Autenticación Firebase
│   ├── users/         # Gestión de usuarios
│   ├── admin/         # Gestión administrativa de patrocinadores
│   ├── projects/      # Proyectos personales
│   ├── milestones/    # Metas/Hitos
│   ├── sprints/       # Sprints
│   ├── tasks/         # Tareas
│   ├── daily-entries/ # Entradas diarias
│   ├── reviews/       # Revisiones
│   ├── retrospectives/# Retrospectivas
│   ├── sponsors/      # Patrocinadores (perfiles)
│   ├── sponsored-goals/ # Objetivos patrocinados
│   ├── gamification/  # Sistema de puntos, badges, recompensas
│   ├── statistics/    # Estadísticas
│   ├── metrics/       # Eventos de métricas
│   └── audit/         # Logs de auditoría
├── shared/
│   ├── guards/        # AuthGuard Firebase, RolesGuard, ApprovedSponsorGuard
│   ├── decorators/    # @CurrentUser(), @Roles()
│   ├── filters/       # Exception filters
│   ├── interceptors/  # Transform interceptors, Logging interceptors
│   └── types/         # Tipos compartidos, enums
└── config/
    ├── database.ts    # Configuración TypeORM
    └── firebase.ts    # Configuración Firebase Admin SDK
```

## Fase 1: Configuración Base y Dependencias

### 1.1 Instalación de dependencias

- `@nestjs/typeorm` y `typeorm` para PostgreSQL
- `pg` (driver PostgreSQL)
- `firebase-admin` para validación de tokens
- `class-validator` y `class-transformer` para validación de DTOs
- `@nestjs/config` para gestión de variables de entorno
- `uuid` para generación de IDs

### 1.2 Configuración de variables de entorno

Crear `.env.example` y documentar:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `PORT`, `NODE_ENV`

### 1.3 Configuración TypeORM

- Configurar conexión a PostgreSQL en `src/config/database.ts`
- Habilitar migraciones automáticas o crear estructura de migraciones

## Fase 2: Módulo de Autenticación (RF-01, RF-02, RF-03, RF-05)

### 2.1 Shared - Firebase Auth Guard

- **`src/shared/guards/firebase-auth.guard.ts`**: Guard que valida Firebase ID Tokens
- Extrae el token del header `Authorization: Bearer <token>`
- Valida usando Firebase Admin SDK
- Extrae `uid` y lo adjunta al request

### 2.2 Shared - Decorador CurrentUser

- **`src/shared/decorators/current-user.decorator.ts`**: Decorador `@CurrentUser()` para acceder al usuario autenticado en controladores

### 2.3 Shared - Roles Guard

- **`src/shared/guards/roles.guard.ts`**: Guard para control de acceso por roles (user, sponsor, admin)
- Decorador `@Roles()` para aplicar en endpoints
- Validar que el usuario tenga el rol requerido

### 2.4 Módulo Auth

- **`src/modules/auth/auth.module.ts`**: Módulo de autenticación
- Endpoint POST `/auth/verify` para verificar tokens (opcional, para testing)
- El guard será usado globalmente o por módulo según necesidad

## Fase 3: Módulo de Usuarios (RF-04)

### 3.1 Dominio

- **`src/modules/users/domain/entities/user.entity.ts`**: Entidad de dominio User
- **`src/modules/users/domain/value-objects/email.vo.ts`**: Value Object para email
- **`src/modules/users/domain/repositories/user.repository.ts`**: Interfaz del repositorio

### 3.2 Aplicación

- **`src/modules/users/application/dto/create-user.dto.ts`**: DTO para creación
  - Campos: `name`, `email`, `role` (user por defecto, puede ser sponsor si se registra como tal)
- **`src/modules/users/application/dto/update-user.dto.ts`**: DTO para actualización
- **`src/modules/users/application/dto/user-response.dto.ts`**: DTO de respuesta
- **`src/modules/users/application/use-cases/create-user.use-case.ts`**: Crear usuario después de registro Firebase
- **`src/modules/users/application/use-cases/get-user-profile.use-case.ts`**: Obtener perfil
- **`src/modules/users/application/use-cases/update-user-profile.use-case.ts`**: Actualizar perfil

### 3.3 Infraestructura

- **`src/modules/users/infrastructure/persistence/user.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `name`, `email` (unique), `firebase_uid` (unique), `role` (enum: user, sponsor, admin), `created_at`, `updated_at`
  - Relaciones: 1:N con projects, 1:1 con sponsors, 1:N con points_transactions, user_rewards, user_badges, daily_entries, sponsor_enrollments, reviews, retrospectives
- **`src/modules/users/infrastructure/persistence/user.repository.impl.ts`**: Implementación del repositorio
- **`src/modules/users/infrastructure/mappers/user.mapper.ts`**: Mapper dominio ↔ ORM

### 3.4 Presentación

- **`src/modules/users/presentation/users.controller.ts`**: Controlador REST
  - POST `/users` (crear usuario - registro)
  - GET `/users/profile` (obtener perfil propio)
  - PUT `/users/profile` (actualizar perfil)
  - Proteger con Firebase Auth Guard

## Fase 4: Módulo de Administración

### 4.1 Dominio

- **`src/modules/admin/domain/repositories/admin.repository.ts`**: Interfaz para operaciones administrativas sobre patrocinadores

### 4.2 Aplicación

- **`src/modules/admin/application/dto/sponsor-approval-request.dto.ts`**: DTO para solicitudes pendientes
- **`src/modules/admin/application/dto/approve-sponsor.dto.ts`**: DTO para aprobar patrocinador
- **`src/modules/admin/application/dto/reject-sponsor.dto.ts`**: DTO para rechazar patrocinador (con motivo opcional)
- **`src/modules/admin/application/dto/update-sponsor-status.dto.ts`**: DTO para cambiar estado (enable/disable)
- **`src/modules/admin/application/use-cases/get-pending-sponsors.use-case.ts`**: Listar solicitudes pendientes de aprobación
  - Buscar sponsors con `status='pending'`
- **`src/modules/admin/application/use-cases/get-sponsor-details.use-case.ts`**: Obtener detalles de un patrocinador específico
- **`src/modules/admin/application/use-cases/approve-sponsor.use-case.ts`**: Aprobar solicitud de patrocinador
  - Cambiar `status` de `pending` a `approved` en tabla `sponsors`
  - Establecer `reviewed_by` con el ID del admin actual
  - Establecer `reviewed_at` con timestamp actual
  - Limpiar `rejection_reason` si existe
- **`src/modules/admin/application/use-cases/reject-sponsor.use-case.ts`**: Rechazar solicitud de patrocinador
  - Cambiar `status` de `pending` a `rejected` en tabla `sponsors`
  - Establecer `reviewed_by`, `reviewed_at` y `rejection_reason`
- **`src/modules/admin/application/use-cases/disable-sponsor.use-case.ts`**: Deshabilitar patrocinador aprobado
  - Cambiar `status` de `approved` a `disabled`
  - Actualizar `reviewed_by` y `reviewed_at`
  - Bloquear acceso a funcionalidades de patrocinio
- **`src/modules/admin/application/use-cases/enable-sponsor.use-case.ts`**: Habilitar patrocinador deshabilitado
  - Cambiar `status` de `disabled` a `approved`
  - Actualizar `reviewed_by` y `reviewed_at`
  - Restaurar acceso a funcionalidades
- **`src/modules/admin/application/use-cases/list-all-sponsors.use-case.ts`**: Listar todos los patrocinadores con filtros por estado

### 4.3 Infraestructura

- **`src/modules/admin/infrastructure/persistence/admin.repository.impl.ts`**: Implementación del repositorio
- Usa el repositorio de sponsors para realizar las operaciones
- **`src/modules/admin/infrastructure/persistence/audit-log.orm-entity.ts`**: Entidad para auditoría
  - Campos: `id`, `user_id` (FK a users), `action`, `entity`, `entity_id`, `previous_data` (json), `new_data` (json), `created_at`
  - Registrar todas las acciones administrativas

### 4.4 Presentación

- **`src/modules/admin/presentation/admin.controller.ts`**: Controlador REST
  - GET `/admin/sponsors/pending` (listar solicitudes pendientes - status='pending') - Solo admin
  - GET `/admin/sponsors` (listar todos los patrocinadores con filtros por status) - Solo admin
  - GET `/admin/sponsors/:sponsorId` (obtener detalles de patrocinador) - Solo admin
  - POST `/admin/sponsors/:sponsorId/approve` (aprobar patrocinador) - Solo admin
  - POST `/admin/sponsors/:sponsorId/reject` (rechazar patrocinador con motivo opcional) - Solo admin
  - POST `/admin/sponsors/:sponsorId/disable` (deshabilitar patrocinador) - Solo admin
  - POST `/admin/sponsors/:sponsorId/enable` (habilitar patrocinador) - Solo admin
  - Todos los endpoints protegidos con `@Roles('admin')`

### 4.5 Validaciones y Reglas de Negocio

- Solo usuarios con `role='admin'` pueden acceder a estos endpoints
- Solo se pueden aprobar/rechazar sponsors con `status='pending'`
- Solo se pueden habilitar/deshabilitar sponsors con `status='approved'` o `status='disabled'`
- Validar que el sponsor existe antes de cambiar su estado
- Registrar todas las acciones en `audit_logs`
- Al deshabilitar un patrocinador, los objetivos patrocinados activos se deben pausar automáticamente

## Fase 5: Módulo de Proyectos (RF-06, RF-07)

### 5.1 Dominio

- **`src/modules/projects/domain/entities/project.entity.ts`**: Entidad Project
  - Regla de negocio: máximo 6 proyectos por usuario
- **`src/modules/projects/domain/value-objects/project-name.vo.ts`**: Value Object nombre
- **`src/modules/projects/domain/services/project.domain-service.ts`**: Lógica de dominio (validación límite 6 proyectos)
- **`src/modules/projects/domain/repositories/project.repository.ts`**: Interfaz repositorio

### 5.2 Aplicación

- **`src/modules/projects/application/dto/create-project.dto.ts`**: DTO creación
  - Campos: `name`, `description`, `purpose`, `budget` (nullable), `final_date` (nullable), `resources_available` (JSON), `resources_needed` (JSON), `schedule` (JSON)
- **`src/modules/projects/application/dto/update-project.dto.ts`**: DTO actualización
- **`src/modules/projects/application/dto/project-response.dto.ts`**: DTO respuesta con relación a milestones
- **`src/modules/projects/application/use-cases/create-project.use-case.ts`**: Crear proyecto
  - Validar límite de 6 proyectos
- **`src/modules/projects/application/use-cases/get-user-projects.use-case.ts`**: Listar proyectos del usuario
- **`src/modules/projects/application/use-cases/get-project-by-id.use-case.ts`**: Obtener proyecto específico
- **`src/modules/projects/application/use-cases/update-project.use-case.ts`**: Actualizar proyecto
- **`src/modules/projects/application/use-cases/delete-project.use-case.ts`**: Eliminar proyecto

### 5.3 Infraestructura

- **`src/modules/projects/infrastructure/persistence/project.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `user_id` (FK a users.id), `name`, `description`, `purpose`, `budget` (nullable), `final_date` (nullable), `resources_available` (JSON), `resources_needed` (JSON), `schedule` (JSON), `created_at`
  - Relación ManyToOne con User
  - Relación 1:N con Milestones
- **`src/modules/projects/infrastructure/persistence/project.repository.impl.ts`**: Implementación
- **`src/modules/projects/infrastructure/mappers/project.mapper.ts`**: Mapper

### 5.4 Presentación

- **`src/modules/projects/presentation/projects.controller.ts`**: Controlador
  - GET `/projects` (listar proyectos del usuario)
  - POST `/projects` (crear proyecto)
  - GET `/projects/:id` (obtener proyecto)
  - PUT `/projects/:id` (actualizar)
  - DELETE `/projects/:id` (eliminar)

## Fase 6: Módulo de Milestones (RF-07)

### 6.1 Infraestructura

- **`src/modules/milestones/infrastructure/persistence/milestone.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `project_id` (FK a projects.id), `name`, `description`, `created_at`
  - Relación ManyToOne con Project
  - Relación 1:N con Sprints

### 6.2 Aplicación

- **`src/modules/milestones/application/dto/create-milestone.dto.ts`**: DTO creación
- **`src/modules/milestones/application/dto/milestone-response.dto.ts`**: DTO respuesta
- **`src/modules/milestones/application/use-cases/create-milestone.use-case.ts`**: Crear milestone
  - Validación: máximo 4 semanas por milestone (validar fecha si se proporciona)
- **`src/modules/milestones/application/use-cases/get-project-milestones.use-case.ts`**: Listar milestones por proyecto
- **`src/modules/milestones/application/use-cases/update-milestone.use-case.ts`**: Actualizar milestone
- **`src/modules/milestones/application/use-cases/delete-milestone.use-case.ts`**: Eliminar milestone

### 6.3 Presentación

- GET `/projects/:projectId/milestones` (listar milestones del proyecto)
- POST `/projects/:projectId/milestones` (crear milestone)
- GET `/milestones/:id` (obtener milestone)
- PUT `/milestones/:id` (actualizar)
- DELETE `/milestones/:id` (eliminar)

## Fase 7: Módulo de Sprints (RF-07)

### 7.1 Infraestructura

- **`src/modules/sprints/infrastructure/persistence/sprint.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `milestone_id` (FK a milestones.id), `name`, `description`, `acceptance_criteria`, `start_date`, `end_date`, `resources_available` (JSON), `resources_needed` (JSON), `created_at`
  - Relación ManyToOne con Milestone
  - Relaciones: 1:N con Tasks, 1:1 con Review, 1:1 con Retrospective

### 7.2 Aplicación

- **`src/modules/sprints/application/dto/create-sprint.dto.ts`**: DTO creación
- **`src/modules/sprints/application/dto/sprint-response.dto.ts`**: DTO respuesta
- **`src/modules/sprints/application/use-cases/create-sprint.use-case.ts`**: Crear sprint
  - Validación: periodo (`end_date - start_date`) no debe exceder el de la milestone
- **`src/modules/sprints/application/use-cases/get-milestone-sprints.use-case.ts`**: Listar sprints por milestone
- **`src/modules/sprints/application/use-cases/update-sprint.use-case.ts`**: Actualizar sprint
- **`src/modules/sprints/application/use-cases/delete-sprint.use-case.ts`**: Eliminar sprint

### 7.3 Presentación

- GET `/milestones/:milestoneId/sprints` (listar sprints del milestone)
- POST `/milestones/:milestoneId/sprints` (crear sprint)
- GET `/sprints/:id` (obtener sprint)
- PUT `/sprints/:id` (actualizar)
- DELETE `/sprints/:id` (eliminar)

## Fase 8: Módulo de Tasks (RF-07)

### 8.1 Infraestructura

- **`src/modules/tasks/infrastructure/persistence/task.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `sprint_id` (FK a sprints.id), `name`, `description`, `start_date`, `end_date`, `resources_available` (JSON), `resources_needed` (JSON), `incentive_points` (integer, default 0), `created_at`
  - Relación ManyToOne con Sprint
  - Relaciones: 1:N con DailyEntry, 1:N con ChecklistItem
  - Nota: El `status` se maneja a través de relaciones (daily_entries completadas, checklist_items completados) o campo calculado

### 8.2 Aplicación

- **`src/modules/tasks/application/dto/create-task.dto.ts`**: DTO creación
- **`src/modules/tasks/application/dto/task-response.dto.ts`**: DTO respuesta (incluye status calculado)
- **`src/modules/tasks/application/use-cases/create-task.use-case.ts`**: Crear tarea
  - Validación: periodo (`end_date - start_date`) no debe exceder el del sprint
- **`src/modules/tasks/application/use-cases/get-sprint-tasks.use-case.ts`**: Listar tareas por sprint
- **`src/modules/tasks/application/use-cases/update-task.use-case.ts`**: Actualizar tarea
- **`src/modules/tasks/application/use-cases/delete-task.use-case.ts`**: Eliminar tarea
- **`src/modules/tasks/application/use-cases/mark-task-completed.use-case.ts`**: Marcar tarea como completada
  - Otorgar puntos según `incentive_points`
  - Crear transacción de puntos
  - Validar si milestone/proyecto está completado

### 8.2 Checklist Items (entidad relacionada)

- **`src/modules/tasks/infrastructure/persistence/checklist-item.orm-entity.ts`**
- Campos: `id` (PK), `task_id` (FK a tasks, nullable), `sponsored_goal_id` (FK a sponsored_goals, nullable), `description`, `is_required` (boolean), `created_at`
- Nota: Un checklist_item puede pertenecer a una tarea (task) o a un objetivo patrocinado (sponsored_goal), pero no a ambos
- Validación: Al menos uno de `task_id` o `sponsored_goal_id` debe estar presente

## Fase 9: Módulo Daily Entries (RF-11)

### 9.1 Infraestructura

- **`src/modules/daily-entries/infrastructure/persistence/daily-entry.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `user_id` (FK a users.id), `task_id` (FK a tasks.id, nullable), `sprint_id` (FK a sprints.id, nullable), `notes_yesterday` (text), `notes_today` (text), `difficulty` (enum - valores a definir: low, medium, high), `energy_change` (enum - valores a definir: increased, stable, decreased), `created_at`
  - Relación ManyToOne con User, Task (opcional), Sprint (opcional)

### 9.2 Aplicación

- **`src/modules/daily-entries/application/dto/create-daily-entry.dto.ts`**: DTO creación
  - Campos: `task_id` (opcional), `sprint_id` (opcional), `notes_yesterday`, `notes_today`, `difficulty`, `energy_change`
- **`src/modules/daily-entries/application/dto/daily-entry-response.dto.ts`**: DTO respuesta
- **`src/modules/daily-entries/application/use-cases/create-daily-entry.use-case.ts`**: Crear entrada diaria
  - Otorgar puntos base por realizar daily entry
  - Crear transacción de puntos
- **`src/modules/daily-entries/application/use-cases/get-user-daily-entries.use-case.ts`**: Listar entradas del usuario con filtros (por fecha, task, sprint)
- **`src/modules/daily-entries/application/use-cases/get-daily-entry-by-date.use-case.ts`**: Obtener entrada por fecha específica

### 9.3 Presentación

- POST `/daily-entries` (crear entrada)
- GET `/daily-entries` (listar entradas del usuario con filtros: fecha, task_id, sprint_id)
- GET `/daily-entries/:id` (obtener entrada específica)
- GET `/daily-entries/date/:date` (obtener entrada por fecha)

## Fase 10: Módulo Reviews y Retrospectives (RF-12)

### 10.1 Infraestructura - Reviews

- **`src/modules/reviews/infrastructure/persistence/review.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `sprint_id` (FK a sprints.id, unique), `user_id` (FK a users.id), `progress_percentage` (number 0-100), `extra_points` (integer), `summary` (text), `created_at`
  - Relación ManyToOne con Sprint (1:1) y User (ManyToOne)
  - Validación: Un sprint solo puede tener una review

### 10.2 Aplicación - Reviews

- **`src/modules/reviews/application/dto/create-review.dto.ts`**: DTO creación
  - Campos: `progress_percentage`, `extra_points`, `summary`
- **`src/modules/reviews/application/dto/review-response.dto.ts`**: DTO respuesta
- **`src/modules/reviews/application/use-cases/create-review.use-case.ts`**: Crear review
  - Validar que el sprint pertenece al usuario
  - Validar que no existe ya una review para el sprint
  - Otorgar puntos extra según `extra_points`
  - Crear transacción de puntos
- **`src/modules/reviews/application/use-cases/get-sprint-review.use-case.ts`**: Obtener review por sprint

### 10.3 Infraestructura - Retrospectives

- **`src/modules/retrospectives/infrastructure/persistence/retrospective.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `sprint_id` (FK a sprints.id, unique), `user_id` (FK a users.id), `what_went_well` (text), `what_went_wrong` (text), `improvements` (text), `is_public` (boolean), `created_at`
  - Relación ManyToOne con Sprint (1:1) y User (ManyToOne)
  - Validación: Un sprint solo puede tener una retrospectiva

### 10.4 Aplicación - Retrospectives

- **`src/modules/retrospectives/application/dto/create-retrospective.dto.ts`**: DTO creación
  - Campos: `what_went_well`, `what_went_wrong`, `improvements`, `is_public`
- **`src/modules/retrospectives/application/dto/retrospective-response.dto.ts`**: DTO respuesta
- **`src/modules/retrospectives/application/use-cases/create-retrospective.use-case.ts`**: Crear retrospectiva
  - Validar que el sprint pertenece al usuario
  - Validar que no existe ya una retrospectiva para el sprint
- **`src/modules/retrospectives/application/use-cases/get-sprint-retrospective.use-case.ts`**: Obtener retrospectiva por sprint (solo si es pública o es del usuario)
- **`src/modules/retrospectives/application/use-cases/get-public-retrospectives.use-case.ts`**: Listar retrospectivas públicas

### 10.5 Presentación

- POST `/sprints/:sprintId/review` (crear review)
- GET `/sprints/:sprintId/review` (obtener review del sprint)
- POST `/sprints/:sprintId/retrospective` (crear retrospectiva)
- GET `/sprints/:sprintId/retrospective` (obtener retrospectiva del sprint - solo si es pública o es del usuario)
- GET `/retrospectives/public` (listar retrospectivas públicas)

## Fase 11: Módulo de Patrocinadores (RF-08, RF-09, RF-10)

### 11.1 Dominio - Sponsors

- **`src/modules/sponsors/domain/entities/sponsor.entity.ts`**: Entidad Sponsor relacionada 1:1 con User
- **`src/modules/sponsors/domain/repositories/sponsor.repository.ts`**: Interfaz del repositorio
- Use cases: crear perfil de patrocinador (cuando usuario solicita rol sponsor), actualizar, obtener perfil
- **Regla de negocio**: Solo usuarios con `role='sponsor'` pueden crear perfil de sponsor. Solo sponsors con `status='approved'` pueden crear/gestionar objetivos patrocinados

### 11.2 Infraestructura - Sponsors

- **`src/modules/sponsors/infrastructure/persistence/sponsor.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `user_id` (FK a users.id, unique), `business_name`, `description`, `category`, `logo_url`, `contact_email`, `status` (enum: pending, approved, rejected, disabled), `reviewed_by` (FK a users.id, nullable), `reviewed_at` (timestamp, nullable), `rejection_reason` (text, nullable), `created_at`
  - Relaciones: 1:N con sponsored_goals, 1:N con announcements
- **`src/modules/sponsors/infrastructure/persistence/sponsor.repository.impl.ts`**: Implementación
- **`src/modules/sponsors/infrastructure/mappers/sponsor.mapper.ts`**: Mapper dominio ↔ ORM

### 11.3 Aplicación - Sponsors

- **`src/modules/sponsors/application/dto/create-sponsor-profile.dto.ts`**: DTO para crear perfil de patrocinador
  - Campos: `business_name`, `description`, `category`, `logo_url`, `contact_email`
  - Al crear, el `status` se establece automáticamente en `pending`
- **`src/modules/sponsors/application/dto/update-sponsor-profile.dto.ts`**: DTO para actualizar perfil
- **`src/modules/sponsors/application/dto/sponsor-response.dto.ts`**: DTO de respuesta
- **`src/modules/sponsors/application/use-cases/create-sponsor-profile.use-case.ts`**: Crear perfil de patrocinador
  - Validar que el usuario tiene `role='sponsor'`
  - Validar que no existe ya un perfil de sponsor para ese usuario
  - Establecer `status='pending'` automáticamente
- **`src/modules/sponsors/application/use-cases/get-sponsor-profile.use-case.ts`**: Obtener perfil del patrocinador
- **`src/modules/sponsors/application/use-cases/update-sponsor-profile.use-case.ts`**: Actualizar perfil
  - Solo permite actualizar si `status='approved'` o `status='pending'`

### 11.4 Dominio - Sponsored Goals

- **`src/modules/sponsored-goals/domain/entities/sponsored-goal.entity.ts`**: Entidad SponsoredGoal
- **`src/modules/sponsored-goals/domain/repositories/sponsored-goal.repository.ts`**: Interfaz del repositorio
- **Regla de negocio**: Validar que el sponsor tiene `status='approved'` antes de crear objetivos
- Validar que `max_users` no se haya alcanzado antes de permitir inscripciones

### 11.5 Infraestructura - Sponsored Goals

- **`src/modules/sponsored-goals/infrastructure/persistence/sponsored-goal.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `sponsor_id` (FK a sponsors.id), `name`, `description`, `criteria` (JSON), `start_date`, `end_date`, `verification_method` (enum: qr, checklist, manual, external_api), `reward_id` (FK a rewards.id), `max_users` (integer), `created_at`
  - Relaciones: 1:N con sponsor_enrollments, 1:N con verification_events, 1:N con checklist_items
- **`src/modules/sponsored-goals/infrastructure/persistence/sponsored-goal.repository.impl.ts`**: Implementación
- **`src/modules/sponsored-goals/infrastructure/mappers/sponsored-goal.mapper.ts`**: Mapper

### 11.6 Aplicación - Sponsored Goals

- **`src/modules/sponsored-goals/application/dto/create-sponsored-goal.dto.ts`**: DTO para crear objetivo patrocinado
  - Campos: `name`, `description`, `criteria` (JSON), `start_date`, `end_date`, `verification_method`, `reward_id`, `max_users`
- **`src/modules/sponsored-goals/application/dto/sponsored-goal-response.dto.ts`**: DTO de respuesta
- **`src/modules/sponsored-goals/application/use-cases/create-sponsored-goal.use-case.ts`**: Crear objetivo patrocinado
  - Validar que el sponsor tiene `status='approved'`
  - Validar que las fechas son válidas
  - Validar que `max_users > 0`
- **`src/modules/sponsored-goals/application/use-cases/list-available-sponsored-goals.use-case.ts`**: Listar objetivos disponibles para usuarios (RF-10)
  - Solo mostrar objetivos activos (fechas válidas, cupo disponible)
- **`src/modules/sponsored-goals/application/use-cases/enroll-in-sponsored-goal.use-case.ts`**: Inscribir usuario a objetivo (RF-10)
  - Validar cupo disponible (`max_users`)
  - Crear registro en `sponsor_enrollments` con `status='pending'` o `status='active'`

### 11.7 Sponsor Enrollments

- **`src/modules/sponsored-goals/infrastructure/persistence/sponsor-enrollment.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `sponsored_goal_id` (FK a sponsored_goals.id), `user_id` (FK a users.id), `status` (enum: pending, active, completed, rejected), `enrolled_at`
  - Relación: 1:N con verification_events
  - Índice único compuesto: (`sponsored_goal_id`, `user_id`) para evitar inscripciones duplicadas

### 11.8 Verificación (RF-09)

- **`src/modules/sponsored-goals/infrastructure/persistence/verification-event.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `enrollment_id` (FK a sponsor_enrollments.id), `sponsored_goal_id` (FK a sponsored_goals.id), `method` (enum: qr, manual, checklist), `data` (JSON - almacena información específica del método), `created_at`
- **`src/modules/sponsored-goals/application/use-cases/verify-task-completion.use-case.ts`**: Verificar completitud de tarea
  - Soporta métodos: manual (patrocinador marca como completado), QR (escanear código), checklist (validar items completados), external_api (integración futura)
  - Crear registro en `verification_events`
  - Actualizar `sponsor_enrollments.status` a `completed` si se cumplen todos los criterios

### 11.9 Presentación - Sponsors

- POST `/sponsors/profile` (crear perfil patrocinador - solo usuarios con role=sponsor, status se establece como 'pending')
- GET `/sponsors/profile` (obtener perfil propio)
- PUT `/sponsors/profile` (actualizar perfil - solo si status='approved' o 'pending')

### 11.10 Presentación - Sponsored Goals

- POST `/sponsors/sponsored-goals` (crear objetivo patrocinado - solo sponsors con status='approved')
- GET `/sponsors/sponsored-goals` (listar objetivos del patrocinador)
- GET `/sponsored-goals` (listar objetivos disponibles para usuarios - RF-10)
- POST `/sponsored-goals/:id/enroll` (inscribirse a objetivo - RF-10, validar cupo)
- POST `/sponsored-goals/:id/verify` (verificar completitud - RF-09, solo patrocinador)
- GET `/sponsored-goals/:id/enrollments` (listar inscripciones de un objetivo - solo patrocinador dueño)

### 11.11 Guards y Validaciones

- **`src/modules/sponsors/guards/approved-sponsor.guard.ts`**: Guard que verifica que el sponsor esté aprobado
  - Aplicar en endpoints de creación/gestión de objetivos patrocinados
  - Lanzar excepción si `status != 'approved'`
- Validar ownership: patrocinadores solo pueden gestionar sus propios objetivos

## Fase 12: Sistema de Gamificación

### 12.1 Points Wallet

- **`src/modules/gamification/infrastructure/persistence/points-wallet.orm-entity.ts`**
- Campos: `id`, `user_id` (unique), `balance` (default 0)
- Relación 1:1 con User

### 12.2 Points Transactions

- **`src/modules/gamification/infrastructure/persistence/points-transaction.orm-entity.ts`**
- Campos: `id`, `user_id`, `change` (positive/negative), `reason`, `source_type` (enum: task, daily, sponsored_goal, review, badge), `source_id`, `created_at`
- Use cases: agregar puntos, deducir puntos, obtener historial de transacciones

### 12.3 Badges

- **`src/modules/gamification/infrastructure/persistence/badge.orm-entity.ts`**
- Campos: `id`, `name`, `description`, `icon_url`, `required_points`, `created_at`

### 12.4 User Badges

- **`src/modules/gamification/infrastructure/persistence/user-badge.orm-entity.ts`**
- Campos: `id`, `user_id`, `badge_id`, `earned_at`
- Relación ManyToMany entre User y Badge

### 12.5 Rewards

- **`src/modules/gamification/infrastructure/persistence/reward.orm-entity.ts`**
- Campos: `id` (PK), `sponsor_id` (FK a sponsors.id, nullable), `name`, `description`, `type` (enum: discount, product, subscription, benefit, internal), `value` (JSON - estructura variable según tipo), `created_at`
- Nota: `sponsor_id` es nullable porque puede haber recompensas internas del sistema (type='internal')
- Relación con SponsoredGoal a través de `reward_id`

### 12.6 User Rewards

- **`src/modules/gamification/infrastructure/persistence/user-reward.orm-entity.ts`**
- Campos: `id` (PK), `user_id` (FK a users.id), `reward_id` (FK a rewards.id), `status` (enum: pending, claimed, delivered), `claimed_at` (timestamp, nullable), `delivered_at` (timestamp, nullable)

### 12.7 Lógica de puntos

- **`src/modules/gamification/domain/services/points.service.ts`**: Servicio de dominio para otorgar puntos
  - **`addPoints(userId, amount, reason, sourceType, sourceId)`**: Método para agregar puntos
  - Crear registro en `points_transactions`
  - Actualizar balance en `points_wallet` (crear si no existe)
  - Al completar tarea: puntos según `incentive_points` del task
  - Al hacer daily entry: puntos base (configurable, ej: 5 puntos)
  - Al completar objetivo patrocinado: puntos según reward asociado (si aplica)
  - Al hacer review: puntos según `extra_points`
  - Al obtener badge: puntos adicionales según configuración del badge (si aplica)
- **`src/modules/gamification/domain/services/badges.service.ts`**: Servicio para verificar y otorgar badges
  - Verificar si el usuario cumple requisitos para obtener un badge (comparar `required_points` con balance)
  - Otorgar badge si no lo tiene ya
  - Crear registro en `user_badges`

### 12.8 Presentación

- GET `/gamification/wallet` (obtener balance de puntos del usuario)
- GET `/gamification/transactions` (historial de transacciones del usuario con paginación)
- GET `/gamification/badges` (listar todos los badges disponibles)
- GET `/gamification/my-badges` (badges obtenidos por el usuario)
- GET `/gamification/rewards` (listar recompensas disponibles - incluir filtros por tipo, sponsor)
- POST `/gamification/rewards/:id/redeem` (canjear recompensa - si aplica deducción de puntos)
- GET `/gamification/my-rewards` (recompensas obtenidas por el usuario con estado)

## Fase 13: Módulo de Estadísticas

### 13.1 Use Cases

- Obtener estadísticas de proyectos (progreso, completitud)
- Obtener estadísticas de metas (completitud por milestone)
- Obtener estadísticas de tareas (completitud por sprint)
- Obtener estadísticas generales del usuario (puntos totales, badges, proyectos activos)

### 13.2 Presentación

- GET `/statistics/projects/:projectId` (estadísticas de proyecto)
- GET `/statistics/milestones/:milestoneId` (estadísticas de milestone)
- GET `/statistics/sprints/:sprintId` (estadísticas de sprint)
- GET `/statistics/user` (estadísticas generales del usuario)

## Fase 14: Módulo de Métricas y Auditoría

### 14.1 Metrics Events

- **`src/modules/metrics/infrastructure/persistence/metrics-event.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `user_id` (FK a users.id, nullable), `event_type` (string), `payload` (jsonb), `created_at`
  - Propósito: Registrar eventos del sistema para análisis y estadísticas
  - Ejemplos de event_type: 'task_completed', 'daily_entry_created', 'reward_claimed', 'sponsor_approved', etc.

### 14.2 Audit Logs

- **`src/modules/audit/infrastructure/persistence/audit-log.orm-entity.ts`**: Entidad TypeORM
  - Campos: `id` (PK), `user_id` (FK a users.id), `action` (string), `entity` (string), `entity_id` (string), `previous_data` (JSON), `new_data` (JSON), `created_at`
  - Propósito: Registrar cambios críticos en el sistema, especialmente acciones administrativas
  - Use cases: registrar cambios de estado de sponsors, modificaciones de roles, etc.

### 14.3 Aplicación

- **`src/modules/metrics/application/use-cases/log-event.use-case.ts`**: Registrar evento de métrica
- **`src/modules/audit/application/use-cases/log-action.use-case.ts`**: Registrar acción en auditoría
- Interceptors para registrar automáticamente acciones administrativas

## Fase 15: Configuración Global y Middleware

### 15.1 Exception Filters

- **`src/shared/filters/http-exception.filter.ts`**: Filter global para manejo de errores sin exponer información sensible

### 15.2 Validation Pipe

- Configurar `ValidationPipe` global con `class-validator`
- Transformar automáticamente DTOs

### 15.3 Main.ts

- Configurar CORS si es necesario
- Habilitar validación global
- Configurar prefijo global `/api` (opcional)

### 15.4 App Module

- **`src/app.module.ts`**: Módulo principal
- Importar todos los módulos:
  - `AuthModule`
  - `UsersModule`
  - `AdminModule`
  - `ProjectsModule`
  - `MilestonesModule`
  - `SprintsModule`
  - `TasksModule`
  - `DailyEntriesModule`
  - `ReviewsModule`
  - `RetrospectivesModule`
  - `SponsorsModule`
  - `SponsoredGoalsModule`
  - `GamificationModule`
  - `StatisticsModule`
  - `MetricsModule`
  - `AuditModule`
- Configurar `ConfigModule` con `@nestjs/config` para variables de entorno
- Configurar `TypeOrmModule` con todas las entidades ORM
- Configurar `FirebaseAdminModule` (módulo personalizado para inicializar Firebase Admin SDK)
- Aplicar guards globales: `FirebaseAuthGuard` (con excepciones para endpoints públicos si los hay)

## Fase 16: Migraciones de Base de Datos

### 16.1 Crear migraciones TypeORM

- Migración inicial con todas las tablas según las definiciones proporcionadas
- Crear enums para: `role` (user, sponsor, admin), `status` en sponsors (pending, approved, rejected, disabled), `verification_method` (qr, checklist, manual, external_api), `enrollment_status` (pending, active, completed, rejected), `reward_type` (discount, product, subscription, benefit, internal), `user_reward_status` (pending, claimed, delivered)
- Índices para:
  - Campos únicos: `email`, `firebase_uid` en users; `user_id` en sponsors (unique); `user_id` en points_wallet (unique)
  - Foreign keys en todas las relaciones
  - Índice compuesto único: (`sponsored_goal_id`, `user_id`) en sponsor_enrollments
  - Índices para búsquedas frecuentes: `status` en sponsors, `event_type` en metrics_events, `action` en audit_logs

### 16.2 Datos Iniciales (Seeds)

- Crear usuario administrador inicial (opcional, dependiendo de estrategia)
- Crear badges iniciales del sistema
- Crear recompensas internas (type='internal') si aplica

## Validaciones y Reglas de Negocio - Actualizado

1. **Límite de proyectos**: Máximo 6 proyectos activos por usuario
2. **Periodo de milestones**: Máximo 4 semanas
3. **Periodo de tareas**: No debe exceder el periodo del sprint
4. **Periodo de sprints**: No debe exceder el periodo de la milestone
5. **Puntos**: Validar balance suficiente antes de canjear recompensas (si aplica)
6. **Patrocinadores**: 

   - Solo usuarios con `role='sponsor'` pueden crear perfil de sponsor
   - Solo sponsors con `status='approved'` pueden crear/gestionar objetivos patrocinados
   - Al crear perfil, `status` se establece automáticamente en `pending`

7. **Inscripciones**: Validar cupo máximo (`max_users`) antes de inscribir usuario a objetivo patrocinado
8. **Verificación**: Solo el patrocinador dueño del objetivo puede verificar tareas
9. **Checklist Items**: Debe tener al menos uno de `task_id` o `sponsored_goal_id`, pero no ambos
10. **Admin**: Solo usuarios con `role='admin'` pueden aprobar/rechazar/deshabilitar sponsors
11. **Auditoría**: Todas las acciones administrativas deben registrarse en `audit_logs`

## Sugerencias de Mejora según Contexto

### Checklist Items

- La entidad `checklist_items` puede pertenecer a `tasks` o `sponsored_goals`. Sugerencia: mantener la validación de que solo uno de los dos campos debe estar presente (XOR constraint).

### Rewards

- El campo `value` como JSON permite flexibilidad según el tipo. Sugerencia: definir estructuras de JSON para cada tipo:
  - `discount`: `{percentage: number, max_amount?: number, code?: string}`
  - `product`: `{product_name: string, description: string, delivery_method: string}`
  - `subscription`: `{service_name: string, duration_days: number}`
  - `benefit`: `{description: string, conditions: string[]}`
  - `internal`: `{points: number}` o similar

### Metrics Events

- El campo `payload` como jsonb permite almacenar información estructurada. Sugerencia: definir schemas para cada `event_type` o usar TypeScript interfaces para validación.

### Verification Events

- El campo `data` como JSON almacena información específica del método. Sugerencia:
  - `qr`: `{qr_code: string, scanned_at: timestamp}`
  - `checklist`: `{completed_items: number[], total_items: number}`
  - `manual`: `{verified_by_sponsor_id: string, notes?: string}`

### Sponsored Goals - Max Users

- Considerar agregar campo `current_users` (contado dinámicamente desde enrollments) o mantenerlo como contador actualizado automáticamente.