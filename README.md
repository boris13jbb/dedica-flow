# DedicaStudio

Plataforma para crear, editar, previsualizar y publicar experiencias web audiovisuales e interactivas completamente parametrizables.

## Estado del Proyecto

**MVP en desarrollo** - FASE 0 y FASE 1 completadas

### Fases Completadas

- ✅ **FASE 0**: Scaffold, tooling y UI base
  - Next.js 16 con App Router
  - TypeScript strict
  - Tailwind CSS
  - Componentes UI (shadcn/ui)
  - Testing setup (Vitest, Playwright)
  - Configuración completa de herramientas

- ✅ **FASE 1**: Supabase + Auth + Migraciones + RLS
  - Clientes de Supabase (browser, server, admin, middleware)
  - Autenticación con email/password
  - Migraciones SQL con RLS
  - Arquitectura multi-tenant
  - Modelos de datos completos

- 🚧 **FASE 2**: Dashboard + Projects CRUD
  - Dashboard administrativo básico
  - Creación de proyectos
  - Página de login
  - Protección de rutas

### Próximas Fases

- **FASE 3**: Editor shell + Zustand + autosave
- **FASE 4**: Scene Registry + campos dinámicos
- **FASE 5**: ExperienceRenderer
- **FASE 6**: Primera plantilla 3D (Galaxy Yellow Flowers)
- **FASE 7**: Media Library + audio
- **FASE 8**: Publication snapshots + versionado
- **FASE 9**: Responsive + performance + fallbacks
- **FASE 10**: Testing + documentación + producción

## Stack Tecnológico

### Frontend/Backend
- **Next.js 16** - App Router
- **React 19** - Componentes
- **TypeScript** - Tipado estricto

### UI
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Base de Datos
- **Supabase PostgreSQL** - Base de datos
- **Supabase Auth** - Autenticación
- **Supabase Storage** - Almacenamiento de archivos

### 3D y Animaciones
- **Three.js** - Motor 3D
- **@react-three/fiber** - React Three
- **@react-three/drei** - Helpers 3D
- **GSAP** - Animaciones

### Estado y Formularios
- **Zustand** - Estado del editor
- **Zod** - Validación
- **React Hook Form** - Formularios
- **dnd-kit** - Drag and drop

### Testing
- **Vitest** - Tests unitarios
- **Testing Library** - Tests de componentes
- **Playwright** - Tests E2E

## Requisitos

- **Node.js** 18+ 
- **npm** 9+
- **Cuenta de Supabase** (para desarrollo)

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd dedicastudio

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

## Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

### Obtener Credenciales de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings > API
3. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key → `SUPABASE_SECRET_KEY`

## Configuración de Supabase

### 1. Ejecutar Migraciones

En el panel de Supabase SQL Editor, ejecuta:

```sql
-- Contenido de: supabase/migrations/20260921000000_initial_schema.sql
```

### 2. Ejecutar Seed (Opcional)

```sql
-- Contenido de: supabase/seed.sql
```

Esto creará la plantilla del sistema "Galaxy Yellow Flowers".

### 3. Crear Primer Usuario

Desde Supabase Dashboard:
1. Ve a Authentication > Users
2. Añade un nuevo usuario manualmente con email y contraseña
3. Confirma el email del usuario

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar linter
npm run lint

# Verificar tipos
npm run type-check

# Ejecutar tests unitarios
npm run test

# Ejecutar tests E2E
npm run test:e2e

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/                  # Rutas de Next.js App Router
│   ├── admin/           # Panel administrativo
│   │   ├── projects/    # Gestión de proyectos
│   │   └── page.tsx     # Dashboard
│   ├── login/           # Autenticación
│   ├── p/               # Experiencias públicas (próximamente)
│   └── api/             # API routes (próximamente)
├── components/
│   ├── admin/           # Componentes administrativos
│   ├── editor/          # Componentes del editor (próximamente)
│   ├── experience/      # Motor de renderizado (próximamente)
│   ├── media/           # Gestión de medios (próximamente)
│   └── ui/              # Componentes UI base
├── lib/
│   ├── auth/            # Autenticación
│   ├── supabase/        # Clientes de Supabase
│   ├── storage/         # Gestión de storage (próximamente)
│   ├── validation/      # Schemas de validación (próximamente)
│   └── utils/           # Utilidades
├── stores/              # Estado global (próximamente)
├── types/               # Tipos TypeScript
└── config/              # Configuración

supabase/
├── migrations/          # Migraciones SQL
└── seed.sql            # Datos iniciales

tests/
├── unit/               # Tests unitarios (próximamente)
└── e2e/                # Tests E2E (próximamente)
```

## Arquitectura

### Multi-Tenancy

El sistema está diseñado para multi-tenancy desde el inicio:

- **Workspaces**: Espacios de trabajo aislados
- **Workspace Members**: Miembros con roles (owner, admin, editor, viewer)
- **RLS**: Row Level Security para aislamiento de datos
- **Ownership**: Todas las entidades pertenecen a un workspace

### Modelo de Datos

```
workspaces
├── workspace_members
├── projects
│   ├── scenes
│   └── publications
├── templates
└── assets
```

### Seguridad

- **RLS habilitado** en todas las tablas críticas
- **Server-side auth** verificada en cada request
- **Secret keys** solo en servidor
- **Políticas de acceso** basadas en membership
- **Publicaciones anónimas** para experiencias públicas

## Flujo de Trabajo

### Crear una Experiencia

1. **Login** → Autenticación
2. **Dashboard** → Ver proyectos
3. **Nuevo Proyecto** → Seleccionar plantilla
4. **Editor** → Personalizar escenas (próximamente)
5. **Preview** → Previsualizar (próximamente)
6. **Publicar** → Generar URL pública (próximamente)

## Testing

```bash
# Tests unitarios con Vitest
npm run test

# Tests unitarios con UI
npm run test:ui

# Tests E2E con Playwright
npm run test:e2e
```

## Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a main

```bash
# O usando Vercel CLI
vercel
```

### Otros Proveedores

La aplicación es una Next.js App Router estándar compatible con cualquier proveedor que soporte Next.js 16+.

## Roadmap

### MVP (En Progreso)

- [x] Autenticación
- [x] Dashboard básico
- [x] Crear proyectos
- [ ] Editor visual
- [ ] Scene Registry
- [ ] Renderer 3D
- [ ] Media Library
- [ ] Sistema de publicación
- [ ] Primera plantilla completa

### Post-MVP

- [ ] Más plantillas
- [ ] Editor de plantillas
- [ ] Colaboración en tiempo real
- [ ] Analytics de experiencias
- [ ] Integración con CDN
- [ ] Sistema de facturación
- [ ] API pública

## Contribución

Este proyecto está en desarrollo activo. Las contribuciones están cerradas hasta el lanzamiento del MVP.

## Licencia

Propietario - Todos los derechos reservados

## Soporte

Para preguntas o issues durante el desarrollo, contacta al equipo de desarrollo.

---

**Última actualización**: Septiembre 2026  
**Versión**: 0.1.0 (MVP en desarrollo)
