# DedicaFlow

[![GitHub Repository](https://img.shields.io/badge/GitHub-dedica--flow-blue?logo=github)](https://github.com/boris13jbb/dedica-flow)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase)](https://supabase.com/)

**Plataforma privada para crear, editar, previsualizar y publicar experiencias audiovisuales interactivas completamente personalizables.**

🔗 **Repositorio:** [github.com/boris13jbb/dedica-flow](https://github.com/boris13jbb/dedica-flow)

## 🎯 Características

- **Editor Visual Completo**: Interfaz de tres columnas (escenas, preview, inspector) con autosave
- **Escenas 3D y 2D**: Intro, Galaxy, Message, Finale, Nebula, Flowers, PhotoOrbit
- **Audio Manager**: Reproducción con fade in/out, control de volumen y loop
- **Media Library**: Gestión de assets con Supabase Storage
- **Sistema de Publicación**: Versionado completo con snapshots y URLs públicas
- **Performance Optimizada**: Detección automática de calidad, WebGL fallbacks, responsive design
- **Multi-tenancy Ready**: Arquitectura preparada para SaaS con workspaces y RLS

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.3.5 (App Router, React Server Components)
- **React**: 19.2.8 con TypeScript strict mode
- **UI Components**: shadcn/ui + Tailwind CSS
- **3D Rendering**: three.js + @react-three/fiber + @react-three/drei
- **Animations**: GSAP + Framer Motion
- **State Management**: Zustand (editor) + React Hook Form
- **Validation**: Zod
- **Drag & Drop**: dnd-kit

### Backend & Database
- **Supabase**: PostgreSQL + Auth + Storage
- **RLS Policies**: Seguridad a nivel de fila
- **Server Actions**: Mutaciones de datos
- **API Routes**: Operaciones de media

### DevOps
- **Deployment**: Vercel (recomendado)
- **Testing**: Vitest + Testing Library + Playwright
- **Linting**: ESLint + TypeScript strict

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase

### 1. Clonar el Repositorio

```bash
git clone https://github.com/boris13jbb/dedica-flow.git
cd dedica-flow
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 4. Configurar Base de Datos

Ejecuta las migraciones en Supabase:

```bash
# En el dashboard de Supabase, ejecuta los archivos SQL en orden:
# 1. supabase/migrations/20260921000000_initial_schema.sql
# 2. supabase/migrations/20260921010000_storage_setup.sql
# 3. supabase/seed.sql (opcional, datos de ejemplo)
```

### 5. Iniciar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
/workspace
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Panel administrativo
│   │   ├── api/               # API Routes
│   │   ├── p/                 # Experiencias públicas
│   │   └── login/             # Autenticación
│   ├── components/
│   │   ├── admin/             # Componentes admin
│   │   ├── editor/            # Editor de experiencias
│   │   ├── experience/        # Renderer y escenas
│   │   ├── media/             # Media library
│   │   ├── publish/           # Sistema de publicación
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades
│   ├── stores/                # Zustand stores
│   └── types/                 # TypeScript types
├── supabase/
│   ├── migrations/            # Migraciones SQL
│   └── seed.sql               # Datos de ejemplo
└── public/                    # Assets estáticos
```

## 🎨 Uso

### 1. Login
Inicia sesión con tu cuenta de Supabase en `/login`.

### 2. Crear Proyecto
- Ve a `/admin` y haz clic en "Nuevo Proyecto"
- Define nombre, slug y título

### 3. Editar Experiencia
- Abre el editor en `/admin/projects/[id]/edit`
- Agrega escenas desde el panel izquierdo
- Configura cada escena en el inspector (derecha)
- Previsualiza en el panel central

### 4. Gestionar Media
- Ve a `/admin/projects/[id]/media`
- Sube imágenes, videos y audios
- Usa los assets en las escenas

### 5. Publicar
- Ve a `/admin/projects/[id]/publish`
- Haz clic en "Publicar" para generar un snapshot
- La experiencia estará disponible en `/p/[slug]`

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Linter
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance

### Optimizaciones Implementadas

1. **Quality Manager**: Ajuste automático de calidad según dispositivo
   - Detección de memoria, DPR, móvil
   - Multiplicador de partículas
   - Configuración de pixelRatio

2. **WebGL Fallback**: Detección y mensaje para navegadores sin WebGL

3. **Lazy Loading**: Suspense boundaries para componentes pesados

4. **Error Boundaries**: Captura y recuperación de errores en renderer

5. **Prefers-reduced-motion**: Respeto a preferencias de accesibilidad

6. **Responsive Design**: Mobile-first con breakpoints optimizados

7. **Bundle Optimization**: 
   - `optimizePackageImports` para three.js y otros
   - Tree-shaking automático
   - Code splitting por ruta

### Métricas de Calidad

| Nivel | Partículas | Bloom | Shadows | Antialias | PixelRatio |
|-------|-----------|-------|---------|-----------|------------|
| Low   | 30%       | ❌    | ❌      | ❌        | ≤1         |
| Medium| 60%       | ❌    | ❌      | ✅        | ≤1.5       |
| High  | 100%      | ✅    | ✅      | ✅        | ≤2         |

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS activas:

- **workspaces**: Solo miembros autorizados
- **workspace_members**: Solo administradores del workspace
- **projects**: Solo miembros del workspace
- **publications**: Solo miembros del workspace (lectura pública para activas)
- **project_assets**: Solo miembros del workspace (lectura pública)

### Bucket Storage

- Escritura: Solo usuarios autenticados de su workspace
- Lectura pública: Todos los assets (necesario para `/p/[slug]`)

## 🌐 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio en Vercel
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático en cada push

### Build Manual

```bash
npm run build
npm start
```

## 🧩 Registro de Escenas

### Escenas Disponibles

| Tipo        | Descripción                                   | Config Principal                |
|-------------|-----------------------------------------------|---------------------------------|
| intro       | Pantalla de bienvenida con partículas         | title, subtitle, duration       |
| galaxy      | Galaxia 3D con estrellas rotantes             | starCount, rotationSpeed        |
| message     | Mensaje animado con estilos configurables     | text, fontSize, color           |
| finale      | Pantalla final con opción de repetir          | message, buttonText             |
| nebula      | Efecto nebulosa 3D con partículas de color    | density, colors, speed          |
| flowers     | Flores 3D con múltiples modos de disposición  | mode, count, texture            |
| photoOrbit  | Fotos orbitando en círculo 3D                 | images, radius, speed           |

### Agregar Nueva Escena

1. Crea el componente en `src/components/experience/scenes/[nombre]/`
2. Registra en `src/components/experience/registry/scene-registry.ts`:

```typescript
export const sceneRegistry = new Map<SceneType, SceneDefinition>([
  // ... escenas existentes
  ['tuEscena', {
    type: 'tuEscena',
    name: 'Tu Escena',
    description: 'Descripción',
    icon: 'icon-name',
    defaultConfig: { /* config por defecto */ },
    editorFields: [ /* campos del inspector */ ],
  }],
])
```

3. Agrega el case en `scene-renderer.tsx`

## 🤝 Contribución

Este proyecto está diseñado como plataforma privada MVP. Para modificaciones:

1. Respeta la arquitectura multi-tenancy
2. Mantén RLS policies actualizadas
3. Ejecuta tests antes de commit
4. Documenta nuevas escenas en el registro

## 📝 Roadmap

- [x] FASE 1-4: Core architecture + Supabase + Auth + Admin + Editor base
- [x] FASE 5: ExperienceRenderer + Audio Manager
- [x] FASE 6: Escenas 3D adicionales (Nebula, Flowers, PhotoOrbit)
- [x] FASE 7: Media Library + Supabase Storage
- [x] FASE 8: Sistema de publicación + versionado
- [x] FASE 9: Responsive + Performance + Fallbacks
- [x] FASE 10: Testing completo + Documentación final + Deploy producción
- [x] ✅ Repositorio publicado en GitHub

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

## 🆘 Soporte

Para problemas o preguntas sobre el proyecto:
- 📝 [Issues en GitHub](https://github.com/boris13jbb/dedica-flow/issues)
- 📚 Documentación de [Next.js](https://nextjs.org/docs)
- 📚 Documentación de [Supabase](https://supabase.com/docs)
- 📚 Documentación de [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

**Desarrollado con ❤️ usando Next.js, React, Three.js y Supabase**
