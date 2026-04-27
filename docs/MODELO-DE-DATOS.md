# Modelo de Datos (MER y descripción de tablas principales)

Documentación del modelo de datos de la aplicación de gestión de metas y objetivos patrocinados (backend). El modelo se implementa con **TypeORM** sobre **PostgreSQL** en un backend **NestJS**.

---

## 1. Modelo Entidad-Relación (MER)

### 1.1 Descripción conceptual

El sistema se organiza en los siguientes bloques principales:

- **Usuarios y roles:** usuarios (con Firebase UID), patrocinadores (perfil extendido de usuario) y relación usuario–categorías de interés.
- **Proyectos y planificación:** proyectos de usuario, hitos (milestones), sprints y tareas (tasks), con estados y fechas.
- **Objetivos patrocinados:** objetivos creados por patrocinadores, inscripciones de usuarios, eventos de verificación y relación N:M con categorías.
- **Seguimiento:** entradas diarias (daily entries), revisiones de sprint y retrospectivas.
- **Gamificación:** carteras de puntos, transacciones, recompensas, insignias y relación usuario–recompensa/insignia.
- **Auditoría:** registro de acciones sobre entidades.

Las relaciones principales son:

- **User** es el centro: tiene proyectos, puede ser sponsor, inscripciones a objetivos, entradas diarias, cartera de puntos, recompensas e insignias.
- **Project** → **Milestone** → **Sprint** → **Task** (jerarquía planificación).
- **Sponsor** crea **SponsoredGoal**; los usuarios se inscriben mediante **SponsorEnrollment**; un proyecto puede ser copia de un objetivo patrocinado (sponsored_goal_id, enrollment_id).
- **SponsoredGoal** se relaciona con **Category** mediante tabla asociativa **sponsored_goal_categories**.
- **Sprint** tiene relación 1:1 con **Review** y **Retrospective**.
- **Task** y **SponsoredGoal** pueden tener **ChecklistItem** (items de verificación).

### 1.2 Diagrama MER (notación lógica)

A continuación se muestra un diagrama entidad-relación en formato Mermaid. Las entidades se representan como bloques con sus atributos clave; las líneas indican relaciones (cardinalidad descrita en el texto anterior).

```mermaid
erDiagram
    users ||--o{ user_categories : "tiene"
    users ||--o{ projects : "crea"
    users ||--o| sponsors : "es"
    users ||--o{ sponsor_enrollments : "se inscribe"
    users ||--o{ daily_entries : "registra"
    users ||--o| points_wallet : "tiene"
    users ||--o{ points_transactions : "recibe"
    users ||--o{ user_rewards : "obtiene"
    users ||--o{ user_badges : "gana"
    users ||--o{ audit_logs : "genera"
    users ||--o{ reviews : "escribe"
    users ||--o{ retrospectives : "escribe"

    categories ||--o{ user_categories : "asociada"
    categories ||--o{ sponsored_goal_categories : "clasifica"

    sponsors ||--o{ sponsored_goals : "crea"
    sponsors ||--o{ rewards : "ofrece"
    sponsors }o--o| users : "revisado_por"

    projects }o--o| sponsored_goals : "origen"
    projects }o--o| sponsor_enrollments : "enrollment"
    projects ||--o{ milestones : "contiene"

    milestones ||--o{ sprints : "contiene"
    milestones ||--o{ tasks : "contiene"

    sprints ||--o{ tasks : "asigna"
    sprints ||--o| reviews : "tiene"
    sprints ||--o| retrospectives : "tiene"
    sprints ||--o{ daily_entries : "referencia"

    sponsored_goals ||--o{ sponsor_enrollments : "inscripciones"
    sponsored_goals }o--|| projects : "proyecto_plantilla"
    sponsored_goals ||--o{ verification_events : "eventos"
    sponsored_goals ||--o{ sponsored_goal_categories : "categorías"

    sponsor_enrollments ||--o{ verification_events : "eventos"
    sponsor_enrollments ||--o{ projects : "copia_proyecto"

    tasks ||--o{ checklist_items : "tiene"
    tasks ||--o{ daily_entries : "referencia"

    rewards ||--o{ user_rewards : "asignada"
    badges ||--o{ user_badges : "otorgada"

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar firebase_uid UK
        enum role
        timestamp created_at
        timestamp updated_at
    }

    projects {
        uuid id PK
        uuid user_id FK
        varchar name
        text description
        uuid sponsored_goal_id FK
        uuid enrollment_id FK
        enum status
        uuid reward_id FK
        timestamp created_at
    }

    milestones {
        uuid id PK
        uuid project_id FK
        varchar name
        enum status
        uuid reward_id
        timestamp created_at
    }

    sprints {
        uuid id PK
        uuid milestone_id FK
        varchar name
        date start_date
        date end_date
        timestamp created_at
    }

    tasks {
        uuid id PK
        uuid milestone_id FK
        uuid sprint_id FK
        varchar name
        enum status
        date start_date
        date end_date
        integer incentive_points
        timestamp created_at
    }

    sponsors {
        uuid id PK
        uuid user_id FK UK
        varchar business_name
        varchar contact_email
        enum status
        uuid reviewed_by FK
        timestamp reviewed_at
        text rejection_reason
        timestamp created_at
    }

    sponsored_goals {
        uuid id PK
        uuid sponsor_id FK
        uuid project_id FK
        varchar name
        date start_date
        date end_date
        enum verification_method
        integer max_users
        timestamp created_at
    }

    sponsor_enrollments {
        uuid id PK
        uuid sponsored_goal_id FK
        uuid user_id FK
        enum status
        timestamp enrolled_at
    }

    categories {
        uuid id PK
        varchar name UK
        text description
        timestamp created_at
    }

    points_wallet {
        uuid id PK
        uuid user_id FK UK
        integer balance
        timestamp created_at
        timestamp updated_at
    }

    rewards {
        uuid id PK
        uuid sponsor_id FK
        varchar name
        text claim_instructions
        varchar claim_link
        timestamp created_at
    }

    badges {
        uuid id PK
        varchar name
        integer required_points
        timestamp created_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity
        varchar entity_id
        jsonb previous_data
        jsonb new_data
        timestamp created_at
    }
```

---

## 2. Descripción de las tablas principales

### 2.1 Usuarios y perfiles

#### `users`
Almacena los usuarios de la aplicación. La autenticación se delega en Firebase; `firebase_uid` es el identificador externo.

| Atributo      | Tipo        | Restricciones | Descripción                          |
|---------------|-------------|---------------|--------------------------------------|
| id            | UUID        | PK            | Identificador interno                 |
| name          | VARCHAR(255)| NOT NULL      | Nombre del usuario                   |
| email         | VARCHAR(255)| NOT NULL, UK  | Correo electrónico                   |
| firebase_uid  | VARCHAR(255)| NOT NULL, UK  | UID de Firebase Auth                 |
| role          | ENUM        | DEFAULT user  | user, sponsor, admin                  |
| created_at    | TIMESTAMP   |               | Fecha de creación                    |
| updated_at    | TIMESTAMP   |               | Fecha de última actualización        |

#### `sponsors`
Perfil de patrocinador: un usuario con rol sponsor tiene un registro aquí. Incluye datos de negocio y flujo de aprobación/rechazo por parte de un admin.

| Atributo        | Tipo          | Restricciones | Descripción                              |
|-----------------|---------------|---------------|------------------------------------------|
| id              | UUID          | PK            | Identificador                            |
| user_id         | UUID          | FK, UK        | Usuario asociado (users.id)              |
| business_name   | VARCHAR(255)  | NOT NULL      | Nombre del negocio                       |
| description     | TEXT          |               | Descripción del patrocinador             |
| category        | VARCHAR(100)  |               | Categoría de actividad                   |
| logo_url        | VARCHAR(500)  |               | URL del logotipo                         |
| contact_email   | VARCHAR(255)  | NOT NULL      | Email de contacto                        |
| status          | ENUM          | DEFAULT pending | pending, approved, rejected, disabled |
| reviewed_by     | UUID          | FK (users)    | Usuario que revisó (admin)               |
| reviewed_at     | TIMESTAMP     |               | Fecha de revisión                         |
| rejection_reason| TEXT          |               | Motivo de rechazo (si aplica)            |
| created_at      | TIMESTAMP     |               | Fecha de creación                        |

---

### 2.2 Categorías e intereses

#### `categories`
Categorías para clasificar objetivos patrocinados y preferencias de usuario.

| Atributo   | Tipo          | Restricciones | Descripción        |
|------------|---------------|---------------|--------------------|
| id         | UUID          | PK            | Identificador      |
| name       | VARCHAR(255)  | NOT NULL, UK  | Nombre             |
| description| TEXT          |               | Descripción        |
| created_at | TIMESTAMP     |               | Fecha de creación  |

#### `user_categories`
Tabla asociativa entre usuarios y categorías (preferencias o intereses). Índice único (user_id, category_id).

| Atributo    | Tipo     | Restricciones | Descripción          |
|-------------|----------|---------------|----------------------|
| id          | UUID     | PK            | Identificador        |
| user_id     | UUID     | FK (users)    | Usuario              |
| category_id | UUID     | FK (categories)| Categoría           |
| created_at  | TIMESTAMP|               | Fecha de creación    |

---

### 2.3 Proyectos, hitos, sprints y tareas

#### `projects`
Proyectos creados por un usuario. Pueden ser propios o copias de un objetivo patrocinado (enrollment).

| Atributo          | Tipo     | Restricciones | Descripción                                      |
|-------------------|----------|---------------|--------------------------------------------------|
| id                | UUID     | PK            | Identificador                                    |
| user_id           | UUID     | FK (users)    | Propietario del proyecto                         |
| name              | VARCHAR(255) | NOT NULL  | Nombre del proyecto                              |
| description       | TEXT     |               | Descripción                                      |
| purpose           | TEXT     |               | Propósito                                        |
| budget            | DECIMAL  |               | Presupuesto                                      |
| final_date        | DATE     |               | Fecha objetivo final                             |
| resources_available| JSONB   |               | Recursos disponibles                             |
| resources_needed  | JSONB    |               | Recursos necesarios                              |
| sponsored_goal_id | UUID     | FK (opcional)  | Objetivo patrocinado origen (si es copia)         |
| enrollment_id     | UUID     | FK (opcional)  | Inscripción asociada (si es copia)               |
| is_active         | BOOLEAN  | DEFAULT true  | Si el proyecto está activo                      |
| status            | ENUM     | DEFAULT pending | pending, in_progress, completed                |
| reward_id         | UUID     | NOT NULL      | Recompensa asociada al proyecto                  |
| created_at        | TIMESTAMP|               | Fecha de creación                                |

#### `milestones`
Hitos de un proyecto. Cada proyecto tiene uno o varios hitos.

| Atributo   | Tipo          | Restricciones | Descripción                    |
|------------|---------------|---------------|--------------------------------|
| id         | UUID          | PK            | Identificador                  |
| project_id | UUID          | FK (projects) | Proyecto                       |
| name       | VARCHAR(255)  | NOT NULL      | Nombre del hito                |
| description| TEXT          |               | Descripción                    |
| status     | ENUM          | DEFAULT pending | pending, in_progress, completed |
| reward_id  | UUID          |               | Recompensa asociada (opcional) |
| created_at | TIMESTAMP     |               | Fecha de creación              |

#### `sprints`
Sprints dentro de un hito. Agrupan tareas en un intervalo de tiempo.

| Atributo            | Tipo     | Restricciones | Descripción              |
|---------------------|----------|---------------|--------------------------|
| id                  | UUID     | PK            | Identificador            |
| milestone_id        | UUID     | FK (milestones)| Hito al que pertenece   |
| name                | VARCHAR(255) | NOT NULL  | Nombre del sprint        |
| description         | TEXT     |               | Descripción              |
| acceptance_criteria | JSONB    |               | Criterios de aceptación  |
| start_date          | DATE     | NOT NULL      | Fecha inicio             |
| end_date            | DATE     | NOT NULL      | Fecha fin                |
| resources_available | JSONB    |               | Recursos disponibles     |
| resources_needed    | JSONB    |               | Recursos necesarios      |
| created_at          | TIMESTAMP|               | Fecha de creación        |

#### `tasks`
Tareas asociadas a un hito y opcionalmente a un sprint.

| Atributo           | Tipo     | Restricciones | Descripción                |
|--------------------|----------|---------------|----------------------------|
| id                 | UUID     | PK            | Identificador              |
| milestone_id       | UUID     | FK (milestones)| Hito                      |
| sprint_id          | UUID     | FK (opcional) | Sprint asignado           |
| name               | VARCHAR(255) | NOT NULL  | Nombre de la tarea         |
| description        | TEXT     |               | Descripción                |
| status             | ENUM     | DEFAULT pending | pending, in_progress, completed |
| start_date         | DATE     | NOT NULL      | Fecha inicio               |
| end_date           | DATE     | NOT NULL      | Fecha fin                  |
| resources_available| JSONB    |               | Recursos disponibles       |
| resources_needed   | JSONB    |               | Recursos necesarios        |
| incentive_points   | INTEGER  | DEFAULT 0     | Puntos por completar       |
| created_at         | TIMESTAMP|               | Fecha de creación          |

#### `checklist_items`
Items de checklist para verificación. Pueden pertenecer a una tarea o a un objetivo patrocinado.

| Atributo          | Tipo     | Restricciones | Descripción                    |
|-------------------|----------|---------------|--------------------------------|
| id                | UUID     | PK            | Identificador                  |
| task_id           | UUID     | FK (opcional) | Tarea (tasks)                  |
| sponsored_goal_id | UUID     |               | Objetivo patrocinado (opcional)|
| description       | TEXT     | NOT NULL      | Descripción del ítem           |
| is_required       | BOOLEAN  | DEFAULT false | Si es obligatorio para verificar|
| is_checked        | BOOLEAN  | DEFAULT false | Si está marcado                |
| created_at        | TIMESTAMP|               | Fecha de creación              |

---

### 2.4 Objetivos patrocinados

#### `sponsored_goals`
Objetivos creados por patrocinadores. Se basan en un proyecto plantilla y definen cupo y método de verificación.

| Atributo           | Tipo     | Restricciones | Descripción                                      |
|--------------------|----------|---------------|--------------------------------------------------|
| id                 | UUID     | PK            | Identificador                                    |
| sponsor_id         | UUID     | FK (sponsors) | Patrocinador creador                             |
| project_id         | UUID     | FK (projects) | Proyecto plantilla                               |
| name               | VARCHAR(255) | NOT NULL  | Nombre del objetivo                              |
| description        | TEXT     |               | Descripción                                      |
| start_date         | DATE     | NOT NULL      | Fecha inicio periodo                             |
| end_date           | DATE     | NOT NULL      | Fecha fin periodo                                |
| verification_method| ENUM     | NOT NULL      | qr, checklist, manual, external_api               |
| reward_id          | UUID     |               | Recompensa asociada (opcional)                   |
| max_users          | INTEGER  | NOT NULL      | Número máximo de usuarios que pueden inscribirse |
| created_at         | TIMESTAMP|               | Fecha de creación                                |

#### `sponsored_goal_categories`
Tabla N:M entre objetivos patrocinados y categorías (JoinTable de TypeORM).

| Columna           | Tipo | Descripción                    |
|-------------------|------|--------------------------------|
| sponsored_goal_id | UUID | FK → sponsored_goals.id       |
| category_id       | UUID | FK → categories.id             |

#### `sponsor_enrollments`
Inscripciones de usuarios a objetivos patrocinados. Índice único (sponsored_goal_id, user_id).

| Atributo          | Tipo     | Restricciones | Descripción              |
|-------------------|----------|---------------|--------------------------|
| id                | UUID     | PK            | Identificador            |
| sponsored_goal_id | UUID     | FK            | Objetivo patrocinado     |
| user_id           | UUID     | FK (users)    | Usuario inscrito         |
| status            | ENUM     | DEFAULT active| active, inactive, completed |
| enrolled_at       | TIMESTAMP|               | Fecha de inscripción     |

#### `verification_events`
Eventos de verificación de completitud (por método QR, checklist, etc.) ligados a una inscripción y un objetivo.

| Atributo          | Tipo     | Restricciones | Descripción                |
|-------------------|----------|---------------|----------------------------|
| id                | UUID     | PK            | Identificador              |
| enrollment_id     | UUID     | FK            | Inscripción                |
| sponsored_goal_id | UUID     | FK            | Objetivo patrocinado       |
| method            | ENUM     | NOT NULL      | Método de verificación     |
| data              | JSONB    |               | Datos adicionales del evento|
| created_at        | TIMESTAMP|               | Fecha del evento           |

---

### 2.5 Seguimiento: entradas diarias, revisiones y retrospectivas

#### `daily_entries`
Entradas diarias de seguimiento por usuario, asociadas a un sprint y opcionalmente a una tarea.

| Atributo       | Tipo     | Restricciones | Descripción                |
|----------------|----------|---------------|----------------------------|
| id             | UUID     | PK            | Identificador              |
| user_id        | UUID     | FK (users)    | Usuario                    |
| task_id        | UUID     | FK (opcional) | Tarea relacionada          |
| sprint_id      | UUID     | FK (sprints)  | Sprint                     |
| notes_yesterday| TEXT     | NOT NULL      | Notas del día anterior     |
| notes_today    | TEXT     | NOT NULL      | Notas del día actual       |
| difficulty     | ENUM     | NOT NULL      | low, medium, high          |
| energy_change  | ENUM     | NOT NULL      | increased, stable, decreased|
| created_at     | TIMESTAMP|               | Fecha de la entrada        |

#### `reviews`
Revisión de un sprint (relación 1:1 con sprint).

| Atributo            | Tipo     | Restricciones | Descripción           |
|---------------------|----------|---------------|-----------------------|
| id                  | UUID     | PK            | Identificador         |
| sprint_id           | UUID     | FK, UK        | Sprint                |
| user_id             | UUID     | FK (users)    | Autor                 |
| progress_percentage | INTEGER  | NOT NULL      | Porcentaje de avance  |
| extra_points        | INTEGER  | DEFAULT 0     | Puntos extra          |
| summary             | TEXT     | NOT NULL      | Resumen               |
| created_at          | TIMESTAMP|               | Fecha de creación     |

#### `retrospectives`
Retrospectiva de un sprint (relación 1:1 con sprint). Puede ser pública.

| Atributo       | Tipo     | Restricciones | Descripción              |
|----------------|----------|---------------|--------------------------|
| id             | UUID     | PK            | Identificador            |
| sprint_id      | UUID     | FK, UK        | Sprint                   |
| user_id        | UUID     | FK (users)    | Autor                    |
| what_went_well | TEXT     | NOT NULL      | Qué fue bien             |
| what_went_wrong| TEXT     | NOT NULL      | Qué fue mal              |
| improvements   | TEXT     |               | Mejoras propuestas       |
| is_public      | BOOLEAN  | DEFAULT false | Si es visible públicamente |
| created_at     | TIMESTAMP|               | Fecha de creación        |

---

### 2.6 Gamificación

#### `points_wallet`
Cartera de puntos por usuario (relación 1:1 con user). user_id único.

| Atributo   | Tipo     | Restricciones | Descripción        |
|------------|----------|---------------|--------------------|
| id         | UUID     | PK            | Identificador      |
| user_id    | UUID     | FK, UK        | Usuario            |
| balance    | INTEGER  | DEFAULT 0     | Saldo de puntos    |
| created_at | TIMESTAMP|               | Fecha de creación  |
| updated_at | TIMESTAMP|               | Última actualización|

#### `points_transactions`
Movimientos de puntos (ganancias o gastos) con motivo y tipo de fuente.

| Atributo   | Tipo     | Restricciones | Descripción                          |
|------------|----------|---------------|--------------------------------------|
| id         | UUID     | PK            | Identificador                        |
| user_id    | UUID     | FK (users)    | Usuario                              |
| change     | INTEGER  | NOT NULL      | Cambio (positivo/negativo)           |
| reason     | TEXT     | NOT NULL      | Motivo                              |
| source_type| ENUM     | NOT NULL      | task, daily, sponsored_goal, review, badge |
| source_id  | UUID     |               | ID de la entidad origen (opcional)   |
| created_at | TIMESTAMP|               | Fecha de la transacción              |

#### `rewards`
Recompensas que pueden ofrecer patrocinadores o el sistema. Se asocian a proyectos/objetivos y se conceden a usuarios.

| Atributo          | Tipo          | Restricciones | Descripción              |
|-------------------|---------------|---------------|--------------------------|
| id                | UUID          | PK            | Identificador            |
| sponsor_id        | UUID          | FK (opcional) | Patrocinador (si aplica) |
| name              | VARCHAR(255)  | NOT NULL      | Nombre                   |
| description       | TEXT          |               | Descripción              |
| claim_instructions| TEXT         |               | Instrucciones para reclamar |
| claim_link        | VARCHAR(500)  |               | Enlace para reclamar     |
| created_at        | TIMESTAMP     |               | Fecha de creación        |

#### `badges`
Insignias desbloqueables por puntos. Sin FK; se definen en catálogo.

| Atributo       | Tipo          | Restricciones | Descripción           |
|----------------|---------------|---------------|-----------------------|
| id             | UUID          | PK            | Identificador         |
| name           | VARCHAR(255)  | NOT NULL      | Nombre               |
| description    | TEXT          |               | Descripción          |
| icon_url       | VARCHAR(500)  |               | URL del icono        |
| required_points| INTEGER       | NOT NULL      | Puntos necesarios    |
| created_at     | TIMESTAMP     |               | Fecha de creación    |

#### `user_rewards`
Asignación de recompensas a usuarios (estado: pendiente, reclamada, entregada).

| Atributo   | Tipo     | Restricciones | Descripción           |
|------------|----------|---------------|-----------------------|
| id         | UUID     | PK            | Identificador         |
| user_id    | UUID     | FK (users)    | Usuario               |
| reward_id  | UUID     | FK (rewards)  | Recompensa            |
| status     | ENUM     | DEFAULT pending | pending, claimed, delivered |
| claimed_at | TIMESTAMP|               | Fecha de reclamación  |
| delivered_at| TIMESTAMP|               | Fecha de entrega      |
| created_at | TIMESTAMP|               | Fecha de asignación   |

#### `user_badges`
Insignias ganadas por usuarios. Índice único (user_id, badge_id).

| Atributo  | Tipo     | Restricciones | Descripción        |
|-----------|----------|---------------|--------------------|
| id        | UUID     | PK            | Identificador      |
| user_id   | UUID     | FK (users)    | Usuario            |
| badge_id  | UUID     | FK (badges)   | Insignia           |
| earned_at | TIMESTAMP|               | Fecha de obtención |

---

### 2.7 Auditoría

#### `audit_logs`
Registro de acciones realizadas por usuarios sobre entidades del sistema.

| Atributo     | Tipo        | Restricciones | Descripción              |
|--------------|-------------|---------------|---------------------------|
| id           | UUID        | PK            | Identificador             |
| user_id      | UUID        | FK (users)    | Usuario que realiza la acción |
| action       | VARCHAR(255)| NOT NULL      | Acción (ej. CREATE, UPDATE) |
| entity       | VARCHAR(255)| NOT NULL      | Tipo de entidad          |
| entity_id    | VARCHAR(255)| NOT NULL      | ID de la entidad         |
| previous_data| JSONB       |               | Estado anterior (si aplica) |
| new_data     | JSONB       |               | Estado nuevo (si aplica)  |
| created_at   | TIMESTAMP   |               | Fecha del evento         |

---

## 3. Enumeraciones (ENUMs)

Resumen de los tipos enumerados usados en el modelo:

| ENUM               | Valores                                                                 | Uso principal                    |
|--------------------|--------------------------------------------------------------------------|----------------------------------|
| UserRole           | user, sponsor, admin                                                     | users.role                       |
| SponsorStatus      | pending, approved, rejected, disabled                                    | sponsors.status                  |
| VerificationMethod | qr, checklist, manual, external_api                                      | sponsored_goals, verification_events |
| EnrollmentStatus   | active, inactive, completed                                              | sponsor_enrollments.status       |
| MilestoneStatus    | pending, in_progress, completed                                          | milestones.status                |
| TaskStatus         | pending, in_progress, completed                                          | tasks.status                     |
| ProjectStatus      | pending, in_progress, completed                                          | projects.status                  |
| UserRewardStatus   | pending, claimed, delivered                                              | user_rewards.status              |
| PointsSourceType   | task, daily, sponsored_goal, review, badge                               | points_transactions.source_type  |
| Difficulty         | low, medium, high                                                        | daily_entries.difficulty         |
| EnergyChange       | increased, stable, decreased                                             | daily_entries.energy_change      |

---

## 4. Resumen de relaciones (FK)

- **users:** referenciado por projects, sponsors, sponsor_enrollments, daily_entries, points_wallet, points_transactions, user_rewards, user_badges, audit_logs, reviews, retrospectives (y como reviewer en sponsors).
- **projects:** referenciado por milestones, sponsored_goals (como plantilla).
- **milestones:** referenciado por sprints, tasks.
- **sprints:** referenciado por tasks, daily_entries, reviews, retrospectives.
- **sponsors:** referenciado por sponsored_goals, rewards; reviewers → users.
- **sponsored_goals:** referenciado por sponsor_enrollments, verification_events, projects (sponsored_goal_id), sponsored_goal_categories.
- **sponsor_enrollments:** referenciado por verification_events, projects (enrollment_id).
- **categories:** referenciado por user_categories, sponsored_goal_categories.
- **tasks:** referenciado por checklist_items, daily_entries.
- **rewards:** referenciado por projects (reward_id), milestones, sponsored_goals, user_rewards.
- **badges:** referenciado por user_badges.

Este documento refleja el modelo definido en las entidades TypeORM del backend y puede usarse como referencia para el Trabajo de Fin de Máster (MER y descripción de tablas principales).
