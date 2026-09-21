# 🏗️ Arquitectura - DedicaFlow

## 📋 Índice

- [Visión General](#visión-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Directorios](#estructura-de-directorios)
- [Flujo de Datos](#flujo-de-datos)
- [Componentes Principales](#componentes-principales)
- [Base de Datos](#base-de-datos)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Rendering 3D](#rendering-3d)
- [Estado Global](#estado-global)
- [Patrones de Diseño](#patrones-de-diseño)

---

## Visión General

DedicaFlow sigue una arquitectura moderna de aplicación web con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Browser)                 │
├─────────────────────────────────────────────────────┤
│  React 19 + Next.js 16 (App Router)                │
│  ├─ UI Components (shadcn/ui + Tailwind)           │
│  ├─ 3D Rendering (Three.js + R3F)                  │
│  ├─ State Management (Zustand)                     │
│  └─ Form Validation (Zod + React Hook Form)        │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│              Next.js Server (Edge + Node)            │
├─────────────────────────────────────────────────────┤
│  ├─ Server Components                               │
│  ├─ Server Actions                                  │
│  ├─ API Routes                                      │
│  └─ Middleware (Auth)                               │
└─────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────┐
│                  Supabase Backend                    │
├─────────────────────────────────────────────────────┤
│  ├─ PostgreSQL (Database)                           │
│  ├─ Auth (Authentication)                           │
│  ├─ Storage (Media Files)                           │
│  └─ Realtime (Future: Collaboration)                │
└─────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend Core
```typescript
Next.js 16.3.5      // Framework React con App Router
React 19.2.8        // Biblioteca UI
TypeScript 5.x      // Tipado estático
```

### UI & Styling
```typescript
Tailwind CSS 4      // Framework CSS utility-first
shadcn/ui          // Componentes UI primitivos
Lucide React       // Iconos
clsx + tw-merge    // Gestión de clases CSS
```

### 3D & Animations
```typescript
Three.js 0.186     // Motor 3D WebGL
@react-three/fiber // React renderer para Three.js
@react-three/drei  // Helpers y abstracciones
GSAP 3.15          // Animaciones timeline
Framer Motion      // Animaciones React declarativas
```

### State & Forms
```typescript
Zustand 5.0        // State management global
React Hook Form    // Gestión de formularios
Zod 4.6            // Validación y parsing
```

### Backend & Database
```typescript
Supabase 2.116     // BaaS (PostgreSQL + Auth + Storage)
@supabase/ssr      // SSR para Next.js App Router
```

### Developer Tools
```typescript
Vitest 5.0         // Testing unitario
Playwright 1.63    // Testing E2E
ESLint 9           // Linter
TypeScript         // Type checking
```

---

## Estructura de Directorios

```
dedica-flow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Grupo de rutas de auth
│   │   │   └── login/               # Página de login
│   │   ├── admin/                   # Panel administrativo
│   │   │   ├── layout.tsx           # Layout con auth check
│   │   │   ├── page.tsx             # Dashboard principal
│   │   │   └── projects/
│   │   │       ├── [id]/
│   │   │       │   ├── edit/        # Editor de experiencias
│   │   │       │   ├── media/       # Media library
│   │   │       │   └── publish/     # Sistema de publicación
│   │   │       └── new/             # Crear proyecto
│   │   ├── api/                     # API Routes
│   │   │   └── media/               # Endpoints de media
│   │   ├── p/                       # Experiencias públicas
│   │   │   └── [slug]/              # Viewer público
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/
│   │   ├── admin/                   # Componentes admin
│   │   │   ├── editor/              # Editor de experiencias
│   │   │   │   ├── EditorLayout.tsx
│   │   │   │   ├── SceneList.tsx
│   │   │   │   ├── PreviewPane.tsx
│   │   │   │   └── InspectorPanel.tsx
│   │   │   ├── projects/            # Gestión de proyectos
│   │   │   └── workspaces/          # Gestión de workspaces
│   │   │
│   │   ├── experience/              # Sistema de experiencias
│   │   │   ├── ExperienceRenderer.tsx
│   │   │   ├── AudioManager.tsx
│   │   │   ├── QualityManager.tsx
│   │   │   ├── scenes/              # Escenas 3D
│   │   │   │   ├── intro/
│   │   │   │   ├── galaxy/
│   │   │   │   ├── message/
│   │   │   │   ├── finale/
│   │   │   │   ├── nebula/
│   │   │   │   ├── flowers/
│   │   │   │   └── photo-orbit/
│   │   │   └── registry/
│   │   │       ├── scene-registry.ts
│   │   │       └── scene-renderer.tsx
│   │   │
│   │   ├── media/                   # Media library
│   │   │   ├── MediaUploader.tsx
│   │   │   ├── MediaGrid.tsx
│   │   │   └── MediaPreview.tsx
│   │   │
│   │   ├── publish/                 # Sistema de publicación
│   │   │   ├── PublishPanel.tsx
│   │   │   └── PublicationHistory.tsx
│   │   │
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ... (más componentes)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   ├── useMedia.ts
│   │   └── usePublications.ts
│   │
│   ├── lib/                         # Utilidades y helpers
│   │   ├── supabase/
│   │   │   ├── client.ts            # Supabase client
│   │   │   ├── server.ts            # Supabase server
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── utils.ts                 # Utilidades generales
│   │   └── validations.ts           # Zod schemas
│   │
│   ├── stores/                      # Zustand stores
│   │   ├── editorStore.ts           # Estado del editor
│   │   ├── mediaStore.ts            # Estado de media
│   │   └── authStore.ts             # Estado de auth
│   │
│   └── types/                       # TypeScript types
│       ├── database.ts              # Tipos de DB
│       ├── experience.ts            # Tipos de experiencias
│       ├── scene.ts                 # Tipos de escenas
│       └── media.ts                 # Tipos de media
│
├── supabase/
│   ├── migrations/                  # Migraciones SQL
│   │   ├── 20260921000000_initial_schema.sql
│   │   └── 20260921010000_storage_setup.sql
│   └── seed.sql                     # Datos de ejemplo
│
├── public/                          # Assets estáticos
│   ├── fonts/
│   └── images/
│
├── tests/                           # Tests
│   ├── unit/                        # Tests unitarios
│   └── e2e/                         # Tests E2E
│
└── docs/                            # Documentación
    ├── PERFORMANCE.md
    ├── PRODUCTION.md
    ├── PROYECTO_COMPLETO.md
    └── TESTING.md
```

---

## Flujo de Datos

### 1. Autenticación

```
Usuario → Login Form → Supabase Auth → Session Cookie → Middleware
                                              ↓
                                    Auth Check en Layout
                                              ↓
                                    Redirect a Dashboard o Login
```

### 2. Creación de Experiencia

```
Dashboard → Nuevo Proyecto → Form → Server Action → Supabase Insert
                                                           ↓
                                                    Redirect a Editor
```

### 3. Editor de Experiencias

```
┌──────────────────────────────────────────────────────┐
│                  Editor Layout                        │
├──────────────┬──────────────────┬────────────────────┤
│  Scene List  │  Preview Pane    │  Inspector Panel   │
│              │                  │                    │
│  - Add Scene │  [3D Canvas]     │  - Scene Config    │
│  - Reorder   │  - Live Preview  │  - Field Editors   │
│  - Delete    │  - Play/Pause    │  - Save Button     │
│              │                  │                    │
└──────────────┴──────────────────┴────────────────────┘
         ↓              ↓                  ↓
    Zustand Store ← → React State ← → Supabase
         ↓              ↓                  ↓
    Scene Registry → Scene Renderer → Three.js Scene
```

### 4. Media Upload

```
Media Library → File Input → Client Validation → Supabase Storage Upload
                                                         ↓
                                                  Database Insert
                                                         ↓
                                                  Asset Record
                                                         ↓
                                            Available in Scene Config
```

### 5. Publicación

```
Editor → Publish Button → Create Snapshot → Generate URL
                                ↓
                        Save Publication Record
                                ↓
                        Public URL: /p/[slug]
                                ↓
                        Viewer (Public Access)
```

---

## Componentes Principales

### ExperienceRenderer

Componente raíz que renderiza una experiencia completa.

```typescript
interface ExperienceRendererProps {
  scenes: Scene[]
  autoPlay?: boolean
  onComplete?: () => void
}

// Responsabilidades:
// - Gestionar transiciones entre escenas
// - Coordinar audio
// - Manejar controles de reproducción
// - Error boundaries
```

### SceneRenderer

Renderiza escenas individuales según su tipo.

```typescript
// Usa el registry para obtener el componente correcto
const SceneComponent = sceneRegistry.get(scene.type)

// Renderiza con configuración
<SceneComponent config={scene.config} />
```

### Editor Layout

Sistema de tres columnas con drag & drop.

```typescript
// Layout:
// [Scenes Sidebar] [Preview Canvas] [Inspector Panel]

// Features:
// - Drag & drop de escenas
// - Live preview
// - Autosave
// - Undo/Redo (futuro)
```

---

## Base de Datos

### Schema Principal

```sql
-- Workspaces (multi-tenancy)
workspaces
  ├─ id (uuid, PK)
  ├─ name (text)
  ├─ slug (text, unique)
  └─ created_at (timestamp)

-- Miembros de workspace
workspace_members
  ├─ workspace_id (uuid, FK → workspaces)
  ├─ user_id (uuid, FK → auth.users)
  ├─ role (enum: admin, editor, viewer)
  └─ joined_at (timestamp)

-- Proyectos
projects
  ├─ id (uuid, PK)
  ├─ workspace_id (uuid, FK → workspaces)
  ├─ name (text)
  ├─ slug (text, unique per workspace)
  ├─ title (text)
  ├─ scenes (jsonb)  -- Array de escenas
  └─ created_at, updated_at

-- Assets de media
project_assets
  ├─ id (uuid, PK)
  ├─ project_id (uuid, FK → projects)
  ├─ type (enum: image, video, audio)
  ├─ url (text)
  ├─ filename (text)
  ├─ size (bigint)
  └─ uploaded_at (timestamp)

-- Publicaciones
publications
  ├─ id (uuid, PK)
  ├─ project_id (uuid, FK → projects)
  ├─ version (int)
  ├─ snapshot (jsonb)  -- Snapshot completo
  ├─ is_active (boolean)
  └─ published_at (timestamp)
```

### Row Level Security (RLS)

```sql
-- Ejemplo: Solo miembros del workspace pueden ver proyectos
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Publicaciones activas son públicas
CREATE POLICY "Anyone can view active publications"
  ON publications FOR SELECT
  USING (is_active = true);
```

---

## Autenticación y Seguridad

### Flujo de Autenticación

```typescript
// 1. Login
await supabase.auth.signInWithPassword({
  email,
  password
})

// 2. Middleware verifica sesión
// middleware.ts
export async function middleware(request: NextRequest) {
  const { session } = await getSession(request)
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect('/login')
  }
}

// 3. Server Components acceden a session
// layout.tsx (server component)
const { session } = await getSession()
```

### Niveles de Seguridad

```
1. Frontend Validation (Zod)
   ↓
2. Server Action Validation
   ↓
3. Supabase RLS Policies
   ↓
4. Database Constraints
```

---

## Rendering 3D

### Arquitectura de Escenas

```typescript
// Jerarquía de Three.js
<Canvas>                         // React Three Fiber Canvas
  <ExperienceRenderer>           // Gestor de experiencia
    <SceneRenderer>              // Renderiza escena actual
      <GalaxyScene>              // Escena específica
        <Stars />                // Mesh de estrellas
        <ParticleSystem />       // Sistema de partículas
        <PostProcessing />       // Efectos post-proceso
      </GalaxyScene>
    </SceneRenderer>
    <AudioManager />             // Gestión de audio
  </ExperienceRenderer>
  <PerformanceMonitor />         // Monitor de FPS
</Canvas>
```

### Quality Manager

```typescript
// Detecta capacidad del dispositivo
const quality = detectQuality({
  memory: navigator.deviceMemory,
  cores: navigator.hardwareConcurrency,
  isMobile: /mobile/i.test(navigator.userAgent),
  dpr: window.devicePixelRatio
})

// Ajusta configuración
if (quality === 'low') {
  particleCount *= 0.3
  pixelRatio = 1
  enableBloom = false
}
```

---

## Estado Global

### Zustand Stores

```typescript
// editorStore.ts
interface EditorState {
  scenes: Scene[]
  currentScene: number
  isPlaying: boolean
  
  addScene: (scene: Scene) => void
  removeScene: (id: string) => void
  updateScene: (id: string, config: any) => void
  reorderScenes: (from: number, to: number) => void
}

// Uso en componentes
const { scenes, addScene } = useEditorStore()
```

### Server State (Supabase)

```typescript
// Queries con Supabase
const { data: project } = await supabase
  .from('projects')
  .select('*, project_assets(*)')
  .eq('id', projectId)
  .single()

// Real-time subscriptions (futuro)
supabase
  .channel('projects')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'projects'
  }, handleUpdate)
  .subscribe()
```

---

## Patrones de Diseño

### 1. Compound Components (Editor)

```typescript
<EditorLayout>
  <EditorLayout.Sidebar />
  <EditorLayout.Preview />
  <EditorLayout.Inspector />
</EditorLayout>
```

### 2. Registry Pattern (Escenas)

```typescript
const sceneRegistry = new Map<SceneType, SceneDefinition>([
  ['galaxy', { component: GalaxyScene, config: {...} }],
  ['nebula', { component: NebulaScene, config: {...} }],
])
```

### 3. Factory Pattern (Scene Creation)

```typescript
function createScene(type: SceneType): Scene {
  const definition = sceneRegistry.get(type)
  return {
    id: generateId(),
    type,
    config: definition.defaultConfig
  }
}
```

### 4. Observer Pattern (State Management)

```typescript
// Zustand usa observer pattern internamente
const useStore = create<State>((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 }))
}))
```

### 5. Strategy Pattern (Quality Settings)

```typescript
const strategies = {
  low: { particles: 0.3, bloom: false },
  medium: { particles: 0.6, bloom: false },
  high: { particles: 1.0, bloom: true }
}

const config = strategies[qualityLevel]
```

---

## Performance Optimizations

### 1. Code Splitting

```typescript
// next.config.ts
optimizePackageImports: [
  'three',
  '@react-three/fiber',
  'lucide-react'
]
```

### 2. Lazy Loading

```typescript
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { suspense: true }
)
```

### 3. Memoization

```typescript
const MemoizedScene = memo(SceneComponent, (prev, next) => {
  return prev.config === next.config
})
```

### 4. Virtual Lists

```typescript
// Para listas grandes de assets
<VirtualizedList
  items={assets}
  itemHeight={100}
  renderItem={renderAsset}
/>
```

---

## Escalabilidad Futura

### Horizontal Scaling

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Vercel    │     │  Vercel    │     │  Vercel    │
│  Edge      │     │  Edge      │     │  Edge      │
│  Function  │     │  Function  │     │  Function  │
└────────────┘     └────────────┘     └────────────┘
      ↓                  ↓                  ↓
┌──────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                │
│          + Connection Pooler (PgBouncer)          │
└──────────────────────────────────────────────────┘
```

### Caching Strategy

```
1. Static Assets → CDN (Vercel Edge)
2. API Responses → Redis (future)
3. Database Queries → Supabase Cache
4. Browser → Service Worker (future PWA)
```

---

## Diagramas de Secuencia

### Crear y Publicar Experiencia

```
User → Dashboard → New Project Form → Server Action
                                            ↓
                                      Insert into DB
                                            ↓
                                      Redirect to Editor
                                            ↓
User edits scenes → Autosave → Update DB periodically
                                            ↓
User clicks Publish → Create Snapshot → Insert Publication
                                            ↓
                                      Generate Public URL
                                            ↓
                                      /p/[slug] available
```

---

## Tecnologías de Terceros

| Servicio | Propósito | Alternativas |
|----------|-----------|--------------|
| Supabase | Backend as a Service | Firebase, AWS Amplify |
| Vercel | Hosting & Deploy | Netlify, Railway |
| Three.js | 3D Rendering | Babylon.js, PlayCanvas |
| GSAP | Animaciones | Anime.js, Motion One |

---

## Referencias

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Supabase Docs](https://supabase.com/docs)
- [Three.js Docs](https://threejs.org/docs/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

---

**Última actualización**: 21 Sep 2026
