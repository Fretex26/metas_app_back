# Metas App - Backend Setup

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=metas_app_db

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com

# Application Configuration
PORT=3000
NODE_ENV=development
```

**Nota importante**: El `FIREBASE_PRIVATE_KEY` debe estar entre comillas y con los `\n` escapados correctamente.

### 3. Configurar Firebase Admin SDK

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Configuración del proyecto > Cuentas de servicio
4. Haz clic en "Generar nueva clave privada"
5. Descarga el archivo JSON
6. Extrae los valores necesarios:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 4. Configurar PostgreSQL

Asegúrate de tener PostgreSQL instalado y corriendo. Crea la base de datos:

```sql
CREATE DATABASE metas_app_db;
```

### 5. Ejecutar la aplicación

```bash
# Desarrollo (con watch mode)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Swagger/OpenAPI

Una vez que la aplicación esté corriendo, puedes acceder a la documentación de Swagger en:

**http://localhost:3000/api/docs**

### Cómo usar Swagger

1. **Acceder a la documentación**: Abre http://localhost:3000/api/docs en tu navegador

2. **Autenticación con Firebase**:
   - En la parte superior de la página de Swagger, verás un botón "Authorize" 🔒
   - Haz clic en "Authorize"
   - Ingresa tu Firebase ID Token (obtenido desde tu aplicación móvil o Firebase Console)
   - Haz clic en "Authorize"
   - Haz clic en "Close"

3. **Probar endpoints**:
   - Expande cualquier endpoint haciendo clic en él
   - Haz clic en "Try it out"
   - Completa los parámetros requeridos
   - Haz clic en "Execute"
   - Verás la respuesta en la parte inferior

### Obtener un Firebase ID Token para pruebas

Puedes obtener un token de prueba desde Firebase Console:
- Ve a Authentication > Users
- Selecciona un usuario
- Haz clic en "..." > "Copy UID"
- Usa el UID con el SDK de Firebase para obtener el token

O usa la consola de Firebase:

```javascript
// En la consola de tu aplicación web con Firebase
firebase.auth().currentUser.getIdToken().then(token => console.log(token));
```

## Estructura del Proyecto

```
src/
├── config/              # Configuraciones (DB, Firebase)
├── modules/             # Módulos de la aplicación (Clean Architecture)
│   ├── users/          # Módulo de usuarios
│   ├── projects/       # Módulo de proyectos
│   └── ...
├── shared/              # Código compartido
│   ├── decorators/     # Decoradores personalizados (@CurrentUser, @Roles)
│   ├── guards/         # Guards (FirebaseAuthGuard, RolesGuard)
│   ├── filters/        # Exception filters
│   └── types/          # Tipos y enums compartidos
└── main.ts             # Punto de entrada
```

## Scripts disponibles

- `npm run start:dev` - Inicia el servidor en modo desarrollo (watch mode)
- `npm run build` - Compila el proyecto TypeScript
- `npm run start:prod` - Inicia el servidor en modo producción
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código con Prettier
- `npm test` - Ejecuta los tests unitarios
- `npm run test:e2e` - Ejecuta los tests end-to-end

## Notas importantes

- La aplicación usa **arquitectura limpia** con separación en capas (domain, application, infrastructure, presentation)
- Todos los endpoints están protegidos por **Firebase Authentication** (excepto los explícitamente públicos)
- La autenticación se hace mediante **Firebase ID Tokens** en el header `Authorization: Bearer <token>`
- El sistema usa **PostgreSQL** como base de datos con **TypeORM**
- **Swagger** está disponible en `/api/docs` para documentación y pruebas interactivas
