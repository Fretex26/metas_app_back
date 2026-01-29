# Categorías: integración frontend

Documento para el equipo frontend sobre el módulo de **categorías**, sus relaciones con otras entidades, lógica de negocio y uso de la API. Permite una implementación adecuada, completa y limpia.

---

## 1. Resumen

Las **categorías** son un **catálogo** compartido en la app. Se usan para:

1. **Usuarios**: marcar sus **categorías de interés** (perfil).
2. **Sponsors**: asignar **categorías** a sus **objetivos patrocinados** (sponsored goals).

La tabla `categories` es el catálogo. Las tablas `user_categories` y `sponsored_goal_categories` son tablas de **enlace** que relacionan usuarios y sponsored goals con esas categorías (relaciones N:M).

---

## 2. Modelo de datos y relaciones

### 2.1 Entidades y tablas

| Entidad         | Tabla                     | Descripción                                        |
|-----------------|---------------------------|----------------------------------------------------|
| **Category**    | `categories`              | Catálogo de categorías (nombre, descripción).      |
| **User**        | `users`                   | Usuarios de la app.                                |
| **UserCategory**| `user_categories`         | Enlace User ↔ Category (categorías de interés).    |
| **SponsoredGoal** | `sponsored_goals`       | Objetivos patrocinados.                            |
| **(join)**      | `sponsored_goal_categories` | Enlace SponsoredGoal ↔ Category (categorías del goal). |

### 2.2 Relaciones

- **User ↔ Category**: **Muchos a muchos** vía `user_categories`. Un usuario tiene varias categorías de interés; una categoría puede estar en muchos usuarios.
- **SponsoredGoal ↔ Category**: **Muchos a muchos** vía `sponsored_goal_categories`. Un goal puede tener varias categorías; una categoría puede estar en muchos goals.

### 2.3 Formato de categoría (API)

En respuestas, una categoría siempre se representa así:

```ts
interface CategoryResponseDto {
  id: string;           // UUID
  name: string;
  description?: string | null;
  createdAt: string;    // ISO 8601
}
```

---

## 3. Endpoints de categorías

Base URL: **`/api`**. Todas las rutas requieren **autenticación** (header `Authorization: Bearer <Firebase ID token>`).

### 3.1 Listar todas las categorías (catálogo)

```
GET /api/categories
```

- **Auth**: Firebase + guard de estado de sponsor (usuarios normales y sponsors pueden llamar).
- **Respuesta**: `200` → array de `CategoryResponseDto`.
- **Uso**: Cargar el catálogo para selectores, filtros, asignación de categorías a users o sponsored goals.

### 3.2 Crear categoría

```
POST /api/categories
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Tecnología",
  "description": "Categoría relacionada con tecnología e innovación"
}
```

| Campo        | Tipo   | Requerido | Descripción                          |
|-------------|--------|-----------|--------------------------------------|
| `name`      | string | Sí        | Max 255 caracteres.                  |
| `description` | string | No      | Descripción opcional.                |

- **Auth**: Mismo que GET. En la práctica, suele usarse desde admin/sponsors.
- **Respuesta**: `201` → `CategoryResponseDto` de la categoría creada.
- **Errores**:
  - `409`: Ya existe una categoría con ese nombre (véase sección 4.1).

**Reglas de negocio (creación):**

- El nombre se **normaliza**: se eliminan espacios, se pasa a minúsculas y la primera letra a mayúscula. La unicidad se comprueba sobre el nombre normalizado.
- Ejemplos: `"  fotografía  "` → `"Fotografía"`; `"DESARROLLO"` → `"Desarrollo"`. No se distinguen mayúsculas/minúsculas ni espacios.

---

## 4. Uso de categorías en otras entidades

### 4.1 Usuario (registro y perfil)

**Crear usuario** `POST /api/users` (habitualmente con `@SkipSponsorStatusGuard` en registro):

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "user",
  "categoryIds": ["uuid-1", "uuid-2"]
}
```

**Actualizar perfil** `PUT /api/users/profile` (usuario autenticado, identificado por token):

```json
{
  "name": "Juan Pérez",
  "categoryIds": ["uuid-1", "uuid-2"]
}
```

- `categoryIds`: array de UUIDs de categorías del catálogo. **Opcional**.
- Si se envía, todos los IDs deben existir en `categories`. Si algún ID no existe, el backend puede devolver error de validación o 400.
- Las categorías del usuario se devuelven en el DTO de usuario (`UserResponseDto`) como `categories: CategoryResponseDto[]`.

### 4.2 Sponsored goals (objetivos patrocinados)

**Crear sponsored goal** `POST /api/sponsored-goals`:

```json
{
  "name": "Completa 10 tareas este mes",
  "description": "...",
  "projectId": "uuid-del-proyecto",
  "categoryIds": ["uuid-cat-1", "uuid-cat-2"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "verificationMethod": "checklist",
  "maxUsers": 100,
  "rewardId": "uuid-opcional"
}
```

- `categoryIds`: **opcional**. Array de UUIDs de categorías. Mismas consideraciones que en usuario.
- Las categorías del goal se devuelven en `SponsoredGoalResponseDto` como `categories: CategoryResponseDto[]` en todos los endpoints que devuelven goals (crear, listar disponibles, detalle, etc.).

**Listar goals disponibles** `GET /api/sponsored-goals/available`:

- Query opcional: **`categoryIds`** = IDs separados por comas, ej.  
  `GET /api/sponsored-goals/available?categoryIds=uuid-1,uuid-2,uuid-3`
- Sin `categoryIds`: se devuelven todos los goals disponibles (entre `startDate` y `endDate`).
- Con `categoryIds`: se devuelven solo los goals que tienen **al menos una** de esas categorías. Los goals siguen filtrados por ventana de fechas.

**Importante:** Los goals devueltos incluyen `categories` completas (no solo IDs). Puedes usar tanto los IDs como los nombres para mostrar etiquetas, filtros, etc.

---

## 5. Lógica de negocio relevante para el frontend

### 5.1 Unicidad de nombres de categoría

- Al crear una categoría, el nombre se normaliza (sin espacios, lower + primera mayúscula).
- No puede haber dos categorías con el mismo nombre normalizado.
- Si se intenta crear una que ya existe → `409` con mensaje del tipo: *"Ya existe una categoría con el nombre \"...\". Los nombres de categorías no distinguen entre mayúsculas y minúsculas ni espacios."*

En UI: evitar duplicados antes de enviar y/o manejar 409 mostrando un mensaje claro.

### 5.2 IDs de categoría en User y SponsoredGoal

- `categoryIds` en create/update deben ser UUIDs válidos y **existir** en el catálogo.
- El backend puede rechazar request si algún ID no existe o no es UUID.
- En formularios, usar siempre opciones obtenidas de `GET /api/categories` para no enviar IDs inválidos.

### 5.3 Filtro de goals por categorías

- `GET /api/sponsored-goals/available?categoryIds=id1,id2,...`:
  - Filtra goals que tengan **al menos una** de las categorías indicadas.
  - Solo se consideran goals en período vigente (`startDate` ≤ hoy ≤ `endDate`).
- Si se envían `categoryIds` vacíos o inválidos, el backend puede devolver lista vacía o error según implementación; conviene validar en front que solo se envíen IDs válidos cuando se use el filtro.

### 5.4 Autenticación y autorización

- **Categorías**: `GET` y `POST` requieren usuario autenticado (Firebase). Guard de estado de sponsor: usuarios no-sponsor pasan; sponsors con estado distinto de `APPROVED` pueden tener restricciones.
- **Sponsored goals**: Mismas consideraciones. Crear goals solo para sponsors aprobados; listar disponibles y enroll suelen estar disponibles para usuarios autenticados según diseño actual.

En frontend: enviar siempre el **Bearer token** (Firebase ID token) en las llamadas a estos endpoints.

---

## 6. Flujos recomendados en frontend

### 6.1 Catálogo y selectores

1. Al cargar pantallas donde se eligen categorías (perfil, crear/editar goal, filtros):  
   `GET /api/categories` → guardar en estado (o cache).
2. Usar ese listado para **selectores múltiples** (checkboxes, multi-select, chips) en usuario y sponsored goal.
3. Al enviar create/update, enviar solo `categoryIds` (array de UUIDs). No hace falta reenviar objetos `CategoryResponseDto` en el body.

### 6.2 Perfil de usuario

1. Cargar perfil con `GET /api/users/profile` → viene `categories`.
2. En edición, pre-rellenar el selector con `user.categories` (mapear `id` a opción seleccionada).
3. Al guardar, enviar `PUT /api/users/profile` con `categoryIds` (y opcionalmente `name`) en el body.

### 6.3 Sponsored goals

1. **Crear**: Formulario con multi-select de categorías (datos de `GET /api/categories`). Enviar `categoryIds` en `POST /api/sponsored-goals`.
2. **Listar disponibles**:  
   - Sin filtro: `GET /api/sponsored-goals/available`.  
   - Con filtro por categorías: `GET /api/sponsored-goals/available?categoryIds=id1,id2,...` (IDs separados por coma).
3. **Mostrar**: Usar `goal.categories` de la respuesta para etiquetas, badges, etc. No hace falta una llamada extra solo para resolver nombres.

### 6.4 Filtro “Goals por categorías”

1. Obtener categorías de `GET /api/categories` (o las del usuario si se filtra “por mis intereses”).
2. Cuando el usuario elige categorías para filtrar, llamar a  
   `GET /api/sponsored-goals/available?categoryIds=...`  
   con los IDs seleccionados.
3. Actualizar la lista de goals al cambiar la selección de categorías.

---

## 7. Errores frecuentes y cómo manejarlos

| Situación | Código | Acción en frontend |
|-----------|--------|--------------------|
| Nombre de categoría duplicado (crear) | `409` | Mostrar mensaje claro; sugerir otro nombre. |
| `categoryIds` con ID inexistente o no UUID | `400` / validación | Usar solo IDs de `GET /api/categories`; validar formato UUID si se permite input manual. |
| Token ausente o inválido | `401` | Redirigir a login / renovar token Firebase. |
| Sponsor pendiente o revocado en acción restringida | `403` | Mostrar mensaje según respuesta del backend. |

---

## 8. Cambios recientes en el backend (contexto para integración)

- La relación **SponsoredGoal ↔ Category** se gestiona como **ManyToMany** con tabla de enlace `sponsored_goal_categories` (solo `sponsored_goal_id` y `category_id`). No hay tabla aparte con `id` propio para esa relación.
- **`GET /api/sponsored-goals/available`** incluye siempre `categories` en cada goal. Antes podía fallar con 500; ese fallo está corregido.
- Las asignaciones **goal–categoría** existentes se **resetearon** en una migración anterior. Los goals creados después de ese cambio tienen sus categorías correctamente; los anteriores pueden tener que reasignarse desde la UI si se desea.

---

## 9. Resumen de endpoints

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/api/categories` | Listar catálogo de categorías. |
| `POST` | `/api/categories` | Crear categoría (nombre, descripción). |
| `GET` | `/api/users/profile` | Obtener perfil del usuario autenticado (incluye `categories`). |
| `PUT` | `/api/users/profile` | Actualizar perfil; body puede incluir `name`, `categoryIds`. |
| `POST` | `/api/users` | Crear usuario (registro); body puede incluir `categoryIds`. |
| `GET` | `/api/sponsored-goals/available` | Listar goals disponibles; opcional `?categoryIds=id1,id2`. |
| `POST` | `/api/sponsored-goals` | Crear goal; body puede incluir `categoryIds`. |

Todos sobre **`/api`**, con **`Authorization: Bearer <Firebase ID token>`** cuando requieran autenticación.

---

Si necesitas más detalle sobre algún endpoint, DTO o regla de negocio, se puede ampliar este documento o añadir ejemplos de request/response concretos.
