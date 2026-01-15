---
name: Integración API Flutter
overview: Plan completo para integrar la API NestJS con Firebase Authentication en una aplicación Flutter siguiendo Clean Architecture, con manejo de errores robusto y estructura modular escalable.
todos:
  - id: setup-base
    content: Configurar Firebase Authentication en Flutter (firebase_core, firebase_auth), variables de entorno (API_BASE_URL), y dependencias principales (dio, riverpod, json_serializable, freezed)
    status: pending
  - id: http-client
    content: Crear cliente HTTP base (api_client.dart) con Dio, configurar timeouts y estructura para interceptores
    status: pending
    dependencies:
      - setup-base
  - id: error-handling
    content: "Implementar manejo centralizado de errores: failures.dart, exceptions.dart, y error_interceptor.dart que parsee el formato { statusCode, message, timestamp, path }"
    status: pending
    dependencies:
      - http-client
  - id: auth-service
    content: Crear servicio de autenticación (auth_datasource.dart) con Firebase Auth y auth_interceptor.dart que agregue Bearer token automáticamente
    status: pending
    dependencies:
      - http-client
      - error-handling
  - id: models-base
    content: "Crear modelos base: user_model.dart, project_model.dart, category_model.dart con serialización JSON usando json_annotation"
    status: pending
    dependencies:
      - setup-base
  - id: datasources-base
    content: "Implementar datasources base: users_datasource.dart, projects_datasource.dart, categories_datasource.dart con todos los endpoints necesarios"
    status: pending
    dependencies:
      - models-base
      - auth-service
  - id: repositories
    content: Crear interfaces de repositorios en domain/ y implementaciones en data/ que mapeen modelos a entidades y manejen errores
    status: pending
    dependencies:
      - datasources-base
  - id: usecases
    content: "Implementar casos de uso principales: get_user_profile, get_user_projects, create_project, list_available_sponsored_goals"
    status: pending
    dependencies:
      - repositories
  - id: providers
    content: "Crear providers con Riverpod para gestión de estado: auth_provider, user_provider, projects_provider, sponsored_goals_provider"
    status: pending
    dependencies:
      - usecases
  - id: models-remaining
    content: "Completar todos los modelos restantes: task_model, milestone_model, sprint_model, daily_entry_model, sponsored_goal_model, enrollment_model, statistics_model"
    status: pending
    dependencies:
      - models-base
  - id: datasources-remaining
    content: "Implementar datasources restantes para todos los módulos: tasks, milestones, sprints, daily_entries, sponsored_goals, statistics, gamification"
    status: pending
    dependencies:
      - models-remaining
      - datasources-base
  - id: optimization
    content: Agregar caché local, manejo de conectividad, logging en debug, y validaciones de formularios
    status: pending
    dependencies:
      - providers
---

# Plan de Integración de API en Flutter

## Resumen

Este plan establece la arquitectura y estructura para integrar la API NestJS (con Firebase Authentication) en una aplicación Flutter, siguiendo Clean Architecture y buenas prácticas para evitar errores comunes.

## Arquitectura General

La aplicación seguirá Clean Architecture con las siguientes capas:

```
lib/
├── core/                    # Código compartido y configuraciones base
│   ├── config/             # Configuraciones (API URLs, Firebase)
│   ├── constants/          # Constantes de la aplicación
│   ├── error/              # Manejo centralizado de errores
│   ├── interceptors/       # Interceptores HTTP
│   ├── network/            # Cliente HTTP configurado
│   └── utils/              # Utilidades generales
├── data/                    # Capa de datos
│   ├── datasources/        # Fuentes de datos (API, Local)
│   ├── models/             # Modelos de datos (DTOs)
│   └── repositories/       # Implementación de repositorios
├── domain/                  # Capa de dominio
│   ├── entities/           # Entidades de dominio
│   ├── repositories/       # Interfaces de repositorios
│   └── usecases/           # Casos de uso
├── presentation/            # Capa de presentación
│   ├── providers/          # Estado (Provider/Riverpod/Bloc)
│   ├── screens/            # Pantallas
│   ├── widgets/            # Widgets reutilizables
│   └── routes/             # Navegación
└── main.dart               # Punto de entrada
```

## Fase 1: Configuración Base y Dependencias

### 1.1 Configuración de Firebase en Flutter

- Configurar Firebase Authentication:
  - Agregar `firebase_core` y `firebase_auth` al `pubspec.yaml`
  - Descargar y configurar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
  - Inicializar Firebase en `main.dart`

- Variables de entorno:
  - Usar `flutter_dotenv` o `flutter_riverpod` para configuraciones
  - Archivo `.env` con `API_BASE_URL` (ej: `http://localhost:3000/api` o producción)
  - No versionar archivos `.env` con credenciales

### 1.2 Dependencias Principales

Agregar al `pubspec.yaml`:

- `dio`: Cliente HTTP con interceptores
- `firebase_core` y `firebase_auth`: Autenticación
- `flutter_riverpod` o `provider`: Gestión de estado
- `json_annotation` y `json_serializable`: Serialización JSON
- `freezed`: Inmutabilidad y generación de código
- `shared_preferences`: Almacenamiento local
- `connectivity_plus`: Verificar conectividad
- `retrofit`: (Opcional) Cliente HTTP tipado

### 1.3 Configuración del Cliente HTTP

Crear `lib/core/network/api_client.dart`:

- Configurar Dio con `baseUrl` desde variables de entorno
- Timeout de conexión (30s) y recepción (60s)
- Interceptores para:
  - Agregar token de Firebase automáticamente
  - Manejo de errores centralizado
  - Logging en desarrollo
  - Refresh token si es necesario

## Fase 2: Manejo de Errores

### 2.1 Modelo de Error

Crear `lib/core/error/failures.dart`:

- Clase base `Failure` con `freezed`
- Tipos específicos: `ServerFailure`, `NetworkFailure`, `AuthFailure`, `ValidationFailure`
- Mapeo de códigos HTTP a tipos de error

### 2.2 Excepciones HTTP

Crear `lib/core/error/exceptions.dart`:

- `ServerException`: Errores del servidor (4xx, 5xx)
- `NetworkException`: Problemas de conectividad
- `UnauthorizedException`: Token inválido/expirado

### 2.3 Interceptor de Errores

En `lib/core/interceptors/error_interceptor.dart`:

- Interceptar respuestas HTTP
- Mapear códigos de estado a excepciones
- Parsear formato de error del backend: `{ statusCode, message, timestamp, path }`
- Lanzar excepciones tipadas para manejo en repositorios

## Fase 3: Autenticación

### 3.1 Servicio de Autenticación

Crear `lib/data/datasources/auth_datasource.dart`:

- Métodos: `signInWithEmail()`, `signUpWithEmail()`, `signOut()`, `getCurrentUser()`
- Integración con Firebase Auth
- Almacenar token ID de Firebase de forma segura

### 3.2 Interceptor de Autenticación

En `lib/core/interceptors/auth_interceptor.dart`:

- Agregar header `Authorization: Bearer <token>` a todas las peticiones
- Obtener token de Firebase: `FirebaseAuth.instance.currentUser?.getIdToken()`
- Manejar token expirado: refrescar automáticamente si es posible
- Redirigir a login si token inválido

### 3.3 Repositorio de Autenticación

Crear `lib/domain/repositories/auth_repository.dart` (interfaz) y `lib/data/repositories/auth_repository_impl.dart`:

- Métodos: `login()`, `register()`, `logout()`, `isAuthenticated()`
- Retornar `Either<Failure, User>` usando `dartz`

## Fase 4: Modelos de Datos

### 4.1 Modelos Basados en DTOs del Backend

Crear modelos en `lib/data/models/` para cada entidad principal:

- `user_model.dart` (basado en `UserResponseDto`)
- `project_model.dart` (basado en `ProjectResponseDto`)
- `task_model.dart` (basado en `TaskResponseDto`)
- `sponsored_goal_model.dart` (basado en `SponsoredGoalResponseDto`)
- `category_model.dart` (basado en `CategoryResponseDto`)
- `milestone_model.dart`
- `sprint_model.dart`
- `daily_entry_model.dart`
- `statistics_model.dart`
- `enrollment_model.dart`

### 4.2 Serialización JSON

- Usar `json_annotation` para todos los modelos
- Métodos `fromJson()` y `toJson()` generados
- Mapeo correcto de fechas (usar extensiones o conversores)
- Manejo de valores opcionales/nullables según DTOs

### 4.3 Entidades de Dominio

Crear entidades simples en `lib/domain/entities/`:

- Sin anotaciones de serialización
- Contener solo lógica de negocio
- Mappers de modelos a entidades en repositorios

## Fase 5: Datasources (API)

### 5.1 Datasource Base

Crear `lib/data/datasources/api_datasource.dart` (abstracta):

- Interfaz común con manejo de errores
- Métodos helper para parsear respuestas

### 5.2 Datasources por Módulo

Crear datasources específicos:

- `users_datasource.dart`: `POST /users`, `GET /users/profile`, `PUT /users/profile`
- `projects_datasource.dart`: `GET /projects`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id`, `GET /projects/:id/progress`
- `tasks_datasource.dart`: CRUD completo de tareas
- `sponsored_goals_datasource.dart`: `GET /sponsored-goals/available`, `POST /sponsored-goals/:id/enroll`, etc.
- `categories_datasource.dart`: `GET /categories`
- `milestones_datasource.dart`: CRUD de milestones
- `sprints_datasource.dart`: CRUD de sprints
- `daily_entries_datasource.dart`: CRUD de entradas diarias
- `statistics_datasource.dart`: `GET /statistics/user`
- `gamification_datasource.dart`: Endpoints de gamificación

### 5.3 Manejo de Query Parameters

- Usar `Map<String, dynamic>` para query params opcionales
- Helper para construir query strings (ej: `categoryIds` separados por coma)

## Fase 6: Repositorios

### 6.1 Interfaces en Domain

Crear interfaces en `lib/domain/repositories/`:

- `user_repository.dart`
- `project_repository.dart`
- `task_repository.dart`
- `sponsored_goal_repository.dart`
- etc.

### 6.2 Implementaciones en Data

Implementar en `lib/data/repositories/`:

- Llamar a datasources correspondientes
- Mapear modelos a entidades
- Manejar errores y convertirlos a `Failure`
- Retornar `Either<Failure, T>` o `Future<Either<Failure, T>>`

## Fase 7: Casos de Uso

Crear casos de uso en `lib/domain/usecases/`:

- Agrupar por módulo (users, projects, tasks, etc.)
- Un caso de uso por operación
- Ejemplos:
  - `users/`: `get_user_profile.dart`, `update_user_profile.dart`, `create_user.dart`
  - `projects/`: `get_user_projects.dart`, `create_project.dart`, `update_project.dart`, `delete_project.dart`, `get_project_progress.dart`
  - `sponsored_goals/`: `list_available_goals.dart`, `enroll_in_goal.dart`, `filter_goals_by_categories.dart`

## Fase 8: Gestión de Estado

### 8.1 Providers (Riverpod)

Crear providers en `lib/presentation/providers/`:

- `auth_provider.dart`: Estado de autenticación
- `user_provider.dart`: Datos del usuario actual
- `projects_provider.dart`: Lista de proyectos
- `tasks_provider.dart`: Tareas
- `sponsored_goals_provider.dart`: Objetivos patrocinados
- `categories_provider.dart`: Categorías

### 8.2 StateNotifiers

Para estado más complejo:

- `projects_notifier.dart`: Manejar carga, error, datos de proyectos
- `tasks_notifier.dart`: Estado de tareas con filtros

## Fase 9: Validación y Testing

### 9.1 Validación de Modelos

- Usar `freezed` para inmutabilidad
- Validar datos antes de enviar al servidor
- Validaciones de formularios con `formz` o validaciones manuales

### 9.2 Testing

- Tests unitarios para casos de uso
- Tests de repositorios con mocks
- Tests de widgets para componentes críticos
- Tests de integración para flujos principales

## Fase 10: Optimizaciones y Mejores Prácticas

### 10.1 Caché Local

- Usar `shared_preferences` o `hive` para caché
- Invalidar caché cuando sea necesario
- Estrategia de refresco de datos

### 10.2 Manejo de Conectividad

- Verificar conectividad antes de peticiones
- Mostrar mensajes apropiados sin conexión
- Sincronización offline (opcional, avanzado)

### 10.3 Logging y Debug

- Logger centralizado para desarrollo
- Deshabilitar logs en producción
- Interceptor de logging solo en modo debug

## Archivos Clave a Crear

### Core

- `lib/core/config/app_config.dart` - Configuración de la app
- `lib/core/network/api_client.dart` - Cliente HTTP base
- `lib/core/interceptors/auth_interceptor.dart` - Token automático
- `lib/core/interceptors/error_interceptor.dart` - Manejo de errores
- `lib/core/error/failures.dart` - Modelos de error
- `lib/core/error/exceptions.dart` - Excepciones HTTP

### Data

- `lib/data/models/` - Todos los modelos DTO
- `lib/data/datasources/` - Todas las fuentes de datos
- `lib/data/repositories/` - Implementaciones de repositorios

### Domain

- `lib/domain/entities/` - Entidades de dominio
- `lib/domain/repositories/` - Interfaces
- `lib/domain/usecases/` - Casos de uso

### Presentation

- `lib/presentation/providers/` - Gestión de estado
- `lib/presentation/screens/` - Pantallas

## Prevención de Errores Comunes

1. **Tokens expirados**: Interceptor que refresque automáticamente
2. **Manejo de nulls**: Usar null-safety de Dart correctamente
3. **Fechas**: Convertir correctamente de String a DateTime
4. **Enums**: Mapear correctamente los enums del backend (UserRole, TaskStatus, etc.)
5. **Query params**: Validar formato antes de enviar
6. **CORS**: Asegurar que el backend acepte requests desde Flutter
7. **Timeouts**: Configurar timeouts apropiados
8. **Serialización**: Validar que todos los campos opcionales se manejen correctamente

## Orden de Implementación Recomendado

1. Configuración base (Firebase, dependencias, cliente HTTP)
2. Manejo de errores
3. Autenticación (login, registro, token)
4. Modelos básicos (User, Project)
5. Repositorios básicos
6. Casos de uso básicos
7. Providers y UI básica
8. Extender a otros módulos
9. Optimizaciones y testing