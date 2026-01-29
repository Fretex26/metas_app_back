# Daily entries: filtro por sprint

Cambios en la API de daily entries para alinear el backend con el modelo de dominio: **cada daily entry pertenece a un sprint**. Se exige `sprintId` al crear y al obtener por fecha, y se filtra por sprint para evitar devolver la entrada de otro sprint (p. ej. en la página de detalle de un sprint).

---

## 1. Resumen de cambios

| Aspecto | Antes | Ahora |
|--------|--------|--------|
| **GET por fecha** | `GET /api/daily-entries/date/:date` sin sprint | `GET /api/daily-entries/date/:date?sprintId=xxx`; `sprintId` **obligatorio** |
| **Respuesta si no hay entrada** | `200` con `null` | `404` (no existe entrada para esa fecha en ese sprint) |
| **Crear** | `sprintId` ya requerido en body | Sigue requerido; validación "una por día" pasa a **"una por día por sprint"** |
| **Unicidad** | Una entrada por usuario por día (global) | Una entrada por usuario por día **por sprint** |

---

## 2. Obtener por fecha y sprint

**`GET /api/daily-entries/date/:date?sprintId=:sprintId`**

- **Path:** `date` = `YYYY-MM-DD`.
- **Query (obligatorio):** `sprintId` = UUID del sprint.
- **Auth:** Bearer.

**Respuestas:**

- `200`: cuerpo = `DailyEntryResponseDto` (entrada de ese día y ese sprint).
- `400`: `sprintId` ausente o no válido (UUID).
- `404`: no hay entrada para esa fecha en el sprint indicado.

**Ejemplo:**

```http
GET /api/daily-entries/date/2024-01-15?sprintId=123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

En el frontend, al mostrar la página de detalle de un sprint, usar el **`sprintId` del sprint actual** en la llamada (p. ej. en el use case/datasource) en lugar de depender solo del filtrado en UI.

---

## 3. Crear daily entry

**`POST /api/daily-entries`**

- **Body:** `CreateDailyEntryDto`; `sprintId` sigue siendo **obligatorio**.
- **Regla de unicidad:** solo se permite **una entrada por usuario por día por sprint**. Si ya existe una para hoy en ese sprint → `409 Conflict`.

Mensaje de error típico:  
`"Ya existe una entrada diaria para hoy en este sprint. Solo se permite una por día y sprint."`

---

## 4. Implementación en backend (breve)

- **Repositorio:** nuevo método `findByUserIdAndDateAndSprintId(userId, date, sprintId)`.
- **GetDailyEntryByDateUseCase:** recibe `sprintId`, usa ese método, lanza `NotFoundException` si no hay entrada.
- **CreateDailyEntryUseCase:** la validación de “una por día” usa `findByUserIdAndDateAndSprintId` (por sprint) en lugar de solo usuario + fecha.
- **Controller:**  
  - `GET .../date/:date`: `@Query() GetDailyEntryByDateQueryDto` con `sprintId` obligatorio; `@ApiQuery('sprintId')`.  
  - `POST ...`: sin cambios de contrato; misma descripción ampliada en Swagger.

---

## 5. Swagger

Los endpoints están documentados en `/api/docs` (tag `daily-entries`). Ahí se ve `sprintId` como query requerido en **Obtener entrada diaria por fecha y sprint** y en el cuerpo de **Crear entrada diaria**.
