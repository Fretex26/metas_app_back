# Sponsored goals: CRUD por el sponsor

Documentación de la **implementación** de los endpoints que permiten al **sponsor** listar, obtener, actualizar y eliminar sus propios objetivos patrocinados. Incluye rutas, DTOs, use cases, lógica de negocio y ejemplos para el frontend.

---

## 1. Qué se implementó

Se añadieron cuatro operaciones además del ya existente **crear** (`POST /api/sponsored-goals`):

| Acción | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| **Listar los del sponsor** | `GET` | `/api/sponsored-goals` | Objetivos creados por el sponsor autenticado |
| **Obtener uno por ID** | `GET` | `/api/sponsored-goals/:id` | Detalle de un objetivo (solo si es del sponsor) |
| **Actualizar** | `PATCH` | `/api/sponsored-goals/:id` | Edición parcial (solo si es del sponsor) |
| **Eliminar** | `DELETE` | `/api/sponsored-goals/:id` | Borrado (solo si es del sponsor) |

Todas las rutas requieren **autenticación** (`Authorization: Bearer <Firebase ID token>`) y que el usuario tenga **perfil de sponsor**. La propiedad del objetivo se comprueba siempre (salvo en listar, donde solo se devuelven los del sponsor).

**Nota:** `GET /api/sponsored-goals/available` sigue existiendo y es distinto: lista objetivos **disponibles para inscribirse** (públicos para usuarios). No confundir con `GET /api/sponsored-goals`, que lista **solo los del sponsor**.

---

## 2. Estructura de la implementación (backend)

### 2.1 Use cases

| Use case | Archivo | Función |
|----------|---------|---------|
| `ListSponsorSponsoredGoalsUseCase` | `application/use-cases/list-sponsor-sponsored-goals.use-case.ts` | Resuelve sponsor por `userId`, devuelve `findBySponsorId(sponsor.id)`. |
| `GetSponsoredGoalByIdUseCase` | `application/use-cases/get-sponsored-goal-by-id.use-case.ts` | `findById`, comprueba que `goal.sponsorId === sponsor.id`, sino 403. |
| `UpdateSponsoredGoalUseCase` | `application/use-cases/update-sponsored-goal.use-case.ts` | Misma comprobación de propiedad; valida fechas, `maxUsers`, `categoryIds`; actualiza solo campos enviados. |
| `DeleteSponsoredGoalUseCase` | `application/use-cases/delete-sponsored-goal.use-case.ts` | Misma comprobación de propiedad; llama a `repository.delete(id)`. |

En todos se obtiene el sponsor desde el usuario autenticado (`userId` / `uid`). Si no hay perfil de sponsor → `404`.

### 2.2 DTOs

- **`UpdateSponsoredGoalDto`** (`application/dto/update-sponsored-goal.dto.ts`): todos los campos opcionales. Solo se envían los que se quieren cambiar. Validación con `class-validator` (tipos, `MaxLength`, `Min`, etc.).
- **`SponsoredGoalResponseDto`**: se usa en todas las respuestas de tipo “objetivo” (listar, obtener, actualizar, crear). Ver sección 4.

### 2.3 Repositorio

- **`ISponsoredGoalRepository`**: `findBySponsorId`, `findById`, `update`, `delete` (además de `create`, `findAvailableGoals`, etc.).
- **`SponsoredGoalRepositoryImpl`**: implementación TypeORM; `update` y `delete` ya existían, se reutilizan.

### 2.4 Controller

- **`SponsoredGoalsController`** (`presentation/sponsored-goals.controller.ts`): nuevas rutas `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.
- **Orden de rutas:** `GET /` y `GET /available` se declaran antes que `GET /:id` para que `"available"` no se interprete como `:id`.
- **Swagger:** cada endpoint tiene `@ApiOperation`, `@ApiParam` donde aplica y `@ApiResponse` (200, 204, 400, 403, 404).

### 2.5 Módulo

- **`SponsoredGoalsModule`**: registra los cuatro use cases nuevos y sigue exportando los repositorios necesarios.

---

## 3. Endpoints en detalle

### 3.1 `GET /api/sponsored-goals` — Listar los del sponsor

- **Respuesta:** `200` → array de `SponsoredGoalResponseDto`.
- **Errores:** `404` si el usuario no tiene perfil de sponsor.

Uso típico: pantalla “Mis objetivos patrocinados”.

---

### 3.2 `GET /api/sponsored-goals/:id` — Obtener uno por ID

- **Params:** `id` = UUID del objetivo.
- **Respuesta:** `200` → `SponsoredGoalResponseDto`.
- **Errores:**
  - `404` — Objetivo no encontrado o usuario sin perfil de sponsor.
  - `403` — El objetivo no pertenece al sponsor.

---

### 3.3 `PATCH /api/sponsored-goals/:id` — Actualizar

- **Params:** `id` = UUID del objetivo.
- **Body:** `UpdateSponsoredGoalDto` (solo campos a modificar).

**Campos editables:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nombre (máx. 255) |
| `description` | string | Descripción |
| `categoryIds` | string[] | UUIDs de categorías; `[]` = quitar todas |
| `startDate` | string (ISO date) | Fecha de inicio |
| `endDate` | string (ISO date) | Fecha de fin |
| `verificationMethod` | enum | `qr`, `checklist`, `manual`, `external_api` |
| `rewardId` | string (UUID) | ID de recompensa; omitir = no cambiar |
| `maxUsers` | number | Máximo de usuarios (≥ 1) |

**Reglas de negocio:**

- `endDate` debe ser posterior a `startDate` (se valida aunque solo se envíe una de las dos; la otra se toma del objetivo actual).
- `maxUsers` ≥ 1.
- Si se envía `categoryIds`, todos los IDs deben existir en el catálogo; si no → `400`.
- `projectId` y `sponsorId` **no** son editables.

**Respuesta:** `200` → `SponsoredGoalResponseDto` actualizado.

**Errores:** `404` (objetivo o perfil), `403` (no dueño), `400` (validación).

---

### 3.4 `DELETE /api/sponsored-goals/:id` — Eliminar

- **Params:** `id` = UUID del objetivo.
- **Respuesta:** `204 No Content` (sin body).
- **Errores:** `404` (objetivo o perfil), `403` (no dueño).

---

## 4. Formato de respuesta (`SponsoredGoalResponseDto`)

Todas las respuestas que devuelven un objetivo (o una lista) usan este formato:

```ts
{
  "id": "uuid",
  "sponsorId": "uuid",
  "projectId": "uuid",
  "name": "string",
  "description": "string | undefined",
  "categories": [
    { "id": "uuid", "name": "string", "description": "string | null", "createdAt": "ISO 8601" }
  ],
  "startDate": "ISO 8601",
  "endDate": "ISO 8601",
  "verificationMethod": "qr" | "checklist" | "manual" | "external_api",
  "rewardId": "uuid | null",
  "maxUsers": 100,
  "createdAt": "ISO 8601"
}
```

`categories` puede ser `[]` si no hay categorías asociadas.

---

## 5. Ejemplos de uso (frontend)

**Listar mis objetivos:**

```http
GET /api/sponsored-goals
Authorization: Bearer <Firebase ID token>
```

**Obtener uno:**

```http
GET /api/sponsored-goals/<uuid>
Authorization: Bearer <Firebase ID token>
```

**Actualizar solo nombre y fechas:**

```http
PATCH /api/sponsored-goals/<uuid>
Content-Type: application/json
Authorization: Bearer <Firebase ID token>

{
  "name": "Nuevo nombre",
  "startDate": "2024-02-01",
  "endDate": "2024-02-28"
}
```

**Actualizar categorías (reemplazar por las indicadas):**

```json
{
  "categoryIds": ["uuid-1", "uuid-2"]
}
```

Para quitar todas: `"categoryIds": []`.

**Eliminar:**

```http
DELETE /api/sponsored-goals/<uuid>
Authorization: Bearer <Firebase ID token>
```

---

## 6. Errores frecuentes y códigos HTTP

| Situación | Código | Mensaje típico |
|-----------|--------|----------------|
| Usuario sin perfil de sponsor | `404` | No se encontró perfil de patrocinador para este usuario |
| Objetivo no encontrado | `404` | Objetivo patrocinado no encontrado |
| Objetivo no pertenece al sponsor | `403` | No tienes permiso para acceder / actualizar / eliminar este objetivo patrocinado |
| Fechas inválidas (`endDate` ≤ `startDate`) | `400` | La fecha de fin debe ser posterior a la fecha de inicio |
| `maxUsers` &lt; 1 | `400` | El número máximo de usuarios debe ser al menos 1 |
| `categoryIds` con ID inexistente | `400` | Una o más categorías especificadas no existen |
| Body con campos no permitidos | `400` | Validación (p. ej. `forbidNonWhitelisted`) |

---

## 7. Resumen de archivos tocados en esta implementación

| Archivo | Cambios |
|---------|---------|
| `domain/repositories/sponsored-goal.repository.ts` | Ya existía `delete`; se usa en el use case de eliminar |
| `application/dto/update-sponsored-goal.dto.ts` | **Nuevo** |
| `application/use-cases/list-sponsor-sponsored-goals.use-case.ts` | **Nuevo** |
| `application/use-cases/get-sponsored-goal-by-id.use-case.ts` | **Nuevo** |
| `application/use-cases/update-sponsored-goal.use-case.ts` | **Nuevo** |
| `application/use-cases/delete-sponsored-goal.use-case.ts` | **Nuevo** |
| `presentation/sponsored-goals.controller.ts` | Nuevas rutas `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` |
| `sponsored-goals.module.ts` | Registro de los cuatro use cases y descripción del módulo |

---

## 8. Swagger y documentación adicional

- Los endpoints están documentados en **Swagger** (`/api/docs`). Buscar el tag `sponsored-goals`.
- Para **crear** objetivos y flujos de **inscripción** / duplicación: `POST /api/sponsored-goals`, `POST /api/sponsored-goals/:id/enroll` y, si existe, `DOC-SPONSORED-GOALS-PLANTILLAS-Y-DUPLICACION.md`.
