# Backend - Discreta Seducción

Backend para el sistema de administración de Discreta Seducción.

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Ajustar las variables según el entorno

4. Inicializar la base de datos:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

## Estructura del Proyecto

```
backend/
├── prisma/           # Modelos y migraciones de la base de datos
├── src/
│   ├── config/      # Configuraciones (DB, JWT, etc)
│   ├── controllers/ # Controladores de la API
│   ├── middlewares/ # Middlewares (auth, errores)
│   ├── routes/      # Definición de rutas
│   ├── services/    # Lógica de negocio
│   └── utils/       # Utilidades (IMC, TMB, etc)
└── index.js         # Punto de entrada
```

## API Endpoints

### Autenticación
- POST /api/auth/login
- POST /api/auth/register

### Pacientes
- GET /api/patients
- GET /api/patients/:id
- POST /api/patients
- PUT /api/patients/:id
- DELETE /api/patients/:id

### Planes
- GET /api/plans
- GET /api/plans/:id
- POST /api/plans
- PUT /api/plans/:id
- DELETE /api/plans/:id 