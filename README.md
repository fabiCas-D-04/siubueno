# UNIVALLE ACADEMIC

Sistema web academico universitario completo para la gestion de la vida academica y administrativa de estudiantes. Inspirado en la experiencia de usuario de sistemas universitarios institucionales (tipo SIU), con identidad visual propia.

---

## 1. Requisitos previos

- **Node.js** 18 o superior
- **PostgreSQL** 12 o superior (corriendo localmente o en un servidor)
- **npm** 9 o superior

---

## 2. Estructura del proyecto

```
/100free
├── backend/                 # API REST (Node.js + Express + TypeScript)
│   └── src/
│       ├── controllers/     # Logica de los endpoints
│       ├── routes/          # Definicion de rutas
│       ├── middleware/      # Autenticacion JWT y manejo de errores
│       ├── database/        # Conexion, esquema y datos de demostracion
│       └── types/           # Tipos TypeScript
├── frontend/                # Aplicacion web (React + TypeScript + Vite)
│   └── src/
│       ├── components/      # Componentes reutilizables (ui + basados en datos)
│       ├── pages/           # Paginas de cada modulo
│       ├── layouts/         # Sidebar, Header, layout principal
│       ├── contexts/        # AuthContext y ThemeContext
│       ├── services/        # Clientes de la API
│       ├── types/           # Tipos TypeScript del frontend
│       └── utils/           # Utilidades de formato
├── scripts/                 # Script auxiliar para crear la base de datos
├── package.json             # Scripts de orquestacion
└── .env.example
```

---

## 3. Configuracion de PostgreSQL

1. Asegurate de tener PostgreSQL instalado y corriendo.
2. Configura el usuario y contrasena de PostgreSQL en las variables de entorno (ver seccion 4).

Credenciales por defecto del ejemplo:

```
host: localhost
puerto: 5432
usuario: postgres
contrasena: postgres
base de datos: univalle_academic
```

---

## 4. Variables de entorno (backend)

Copia el archivo de ejemplo y configuralo:

```bash
cd backend
cp .env.example .env
```

Contenido:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/univalle_academic
JWT_SECRET=univalle-academic-jwt-secret-2024
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- `DATABASE_URL`: cadena de conexion a PostgreSQL (usuario, contrasena, host, puerto, nombre de la base).
- `JWT_SECRET`: secreto para firmar los tokens JWT. **Cambialo** antes de usar en produccion.
- `PORT`: puerto del servidor backend.
- `FRONTEND_URL`: origen permitido para CORS.

> Nunca subas tu archivo `.env` al repositorio. Solo se versiona `.env.example`.

---

## 5. Instalacion

Instala todas las dependencias de backend y frontend con un solo comando:

```bash
npm install
npm run install:all
```

Esto ejecuta:

- `npm install` en la raiz del proyecto
- `npm install` en `backend/`
- `npm install` en `frontend/`

---

## 6. Creacion de la base de datos

Crea la base de datos `univalle_academic` (si no existe):

```bash
npm run db:create
```

> Si tu usuario de PostgreSQL no tiene permisos para crear bases de datos, creala manualmente:
> `CREATE DATABASE univalle_academic;` en tu cliente psql.

---

## 7. Migraciones y seed

El schema de tablas se crea automaticamente al arrancar el backend. Para insertar los datos de demostracion:

```bash
npm run seed
```

Esto crea:

- Un usuario estudiante de prueba
- La carrera, materias, pensum completo
- Inscripciones de 5 semestres (2024-1 a 2026-1)
- Calificaciones, horarios, asistencia
- Tareas y entregas
- Pagos, facturas y estado de cuenta
- Notificaciones y solicitudes
- Eventos del calendario academico

---

## 8. Como ejecutar

### Opcion A: ejecutar todo con un solo comando

```bash
npm run dev
```

Levanta backend (puerto 3001) y frontend (puerto 5173) simultaneamente con `concurrently`.

### Opcion B: ejecutar cada parte por separado

Terminal 1 - Backend:

```bash
npm run dev:backend
```

Terminal 2 - Frontend:

```bash
npm run dev:frontend
```

Abre la aplicacion en: **http://localhost:5173**

---

## 9. Usuario de prueba

| Campo       | Valor           |
|-------------|-----------------|
| Usuario     | `estudiante`    |
| Contrasena  | `Estudiante123` |

Tras iniciar sesion seras redirigido al dashboard con toda la informacion del estudiante de demostracion.

---

## 10. Funcionalidades implementadas

- **Autenticacion**: login con JWT, contraseñas con hash (bcrypt), cierre de sesion, proteccion de rutas.
- **Dashboard**: estadisticas, materias, proximas clases, actividades y actividad reciente.
- **Perfil**: tarjetas de informacion personal con formulario de edicion validado.
- **Mis Materias**: tabla/cards con busqueda, filtros y ordenamiento; cada materia abre un detalle con horario, calificaciones, asistencia y tareas.
- **Calificaciones**: tabla con notas, calculo automatico de nota final, promedios general y del semestre.
- **Historial academico**: semestres expandibles con estadisticas de creditos y materias.
- **Pensum**: plan de estudios por semestre con estados (aprobada, cursando, pendiente, reprobada) y progreso.
- **Horario**: vista semanal en cuadricula y vista de lista para moviles.
- **Asistencia**: resumen por materia con porcentaje, estado y detalle.
- **Tareas**: filtros (todas, pendientes, entregadas, vencidas), vista de detalle y formulario de entrega.
- **Calendario**: vistas mes/semana/dia con eventos diferenciados por color.
- **Estado de Cuenta**: montos total, pagado y saldo pendiente.
- **Pagos**: historial con visto de comprobante y descarga.
- **Facturas**: listado con vista profesional de factura y descarga.
- **Notificaciones**: categorias, marcar leidas, marcar todas y eliminar (con contador en el header).
- **Solicitudes**: creacion de solicitudes y seguimiento por estado.
- **Configuracion**: cuenta, seguridad (cambio de contrasena), notificaciones y preferencias.
- **Modo oscuro**: funciona en toda la aplicacion.
- **Responsive**: sidebar colapsable, menu movil, tablas adaptativas.

---

## 11. API endpoints

| Metodo | Endpoint                            | Descripcion                        |
|--------|-------------------------------------|-------------------------------------|
| POST   | `/api/auth/login`                   | Iniciar sesion                      |
| POST   | `/api/auth/logout`                  | Cerrar sesion                       |
| GET    | `/api/auth/me`                      | Usuario autenticado                 |
| GET    | `/api/dashboard`                    | Datos del panel principal           |
| GET    | `/api/students/profile`             | Perfil del estudiante               |
| PUT    | `/api/students/profile`             | Actualizar perfil                   |
| GET    | `/api/courses`                      | Materias del estudiante             |
| GET    | `/api/courses/:id`                  | Detalle de una materia              |
| GET    | `/api/grades`                       | Calificaciones                      |
| GET    | `/api/schedule`                     | Horario semanal                     |
| GET    | `/api/attendance`                   | Resumen de asistencia               |
| GET    | `/api/attendance/:courseId`         | Detalle de asistencia por materia    |
| GET    | `/api/assignments`                  | Tareas                              |
| POST   | `/api/assignments/:id/submit`       | Entregar tarea                      |
| GET    | `/api/calendar`                     | Eventos del calendario              |
| GET    | `/api/payments`                     | Pagos                               |
| GET    | `/api/invoices`                     | Facturas                            |
| GET    | `/api/notifications`                | Notificaciones                      |
| PUT    | `/api/notifications/:id/read`       | Marcar notificacion como leida      |
| PUT    | `/api/notifications/read-all`       | Marcar todas como leidas            |
| GET    | `/api/requests`                     | Solicitudes                         |
| POST   | `/api/requests`                     | Crear solicitud                     |
| GET    | `/api/pensum`                       | Plan de estudios                    |
| GET    | `/api/history`                      | Historial academico                 |

---

## 12. Comandos utiles

| Comando              | Descripcion                                   |
|----------------------|------------------------------------------------|
| `npm run install:all`| Instala dependencias de backend y frontend     |
| `npm run db:create`  | Crea la base de datos `univalle_academic`      |
| `npm run seed`       | Inserta los datos de demostracion              |
| `npm run dev`        | Ejecuta backend y frontend simultaneamente     |
| `npm run dev:backend`| Ejecuta solo el backend                        |
| `npm run dev:frontend`| Ejecuta solo el frontend                      |
| `npm run build`      | Compila backend y frontend para produccion     |
| `npm run build:api`  | Compila el backend y lo deja en `api/lib`       |

---

## 13. Despliegue en Vercel

El repositorio ya incluye la configuracion de despliegue:

- `vercel.json`: build del frontend (Vite) con salida en `frontend/dist` y funcion serverless para la API.
- `api/[[...path]].js`: funcion Node.js que expone el backend Express en `/api/*`.
- `scripts/prepare-api.js`: copia el backend compilado a `api/lib` durante el build.

Pasos:

1. Sube los cambios al repositorio.
2. En <https://vercel.com> entra a **Add New... > Project** e importa el repositorio (Vercel lee el `vercel.json` automaticamente).
3. En **Settings > Environment Variables** agrega:

   | Variable       | Valor                                  |
   |----------------|----------------------------------------|
   | `JWT_SECRET`   | una cadena larga y aleatoria            |
   | `FRONTEND_URL` | la URL del proyecto en Vercel           |
   | `DB_MODE`      | `memory` (opcional, es el valor por defecto) |

4. Deploy. La app queda en `https://<tu-proyecto>.vercel.app` con la API en `https://<tu-proyecto>.vercel.app/api`.

Notas:

- En Vercel la base de datos es **en memoria** (`pg-mem`): los datos de demostracion se crean en cada arranque en frio, por lo que no se necesita PostgreSQL y los cambios no se conservan.
- Si mas adelante se requiere persistencia, configura `DB_MODE=postgres` y `DATABASE_URL` con un Postgres gestionado (Neon, Supabase, Vercel Postgres).
- Credenciales de prueba: `estudiante / Estudiante123` y `docente / Docente123`.