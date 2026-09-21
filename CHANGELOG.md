# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Por Agregar
- Sistema de notificaciones en tiempo real
- Modo oscuro
- Exportación de experiencias
- Analytics integrado
- Soporte multi-idioma

## [0.1.0] - 2026-09-21

### ✨ Agregado

#### Core Features
- Sistema completo de autenticación con Supabase Auth
- Editor visual de tres columnas (escenas, preview, inspector)
- Sistema de versionado y publicación de experiencias
- Media Library con Supabase Storage
- Audio Manager con fade in/out y loop
- Arquitectura multi-tenancy con workspaces

#### Escenas 3D
- Intro: Pantalla de bienvenida con partículas
- Galaxy: Galaxia 3D con estrellas rotantes
- Message: Mensajes animados configurables
- Finale: Pantalla final con opción de repetir
- Nebula: Efecto nebulosa con partículas de color
- Flowers: Flores 3D con múltiples modos de disposición
- PhotoOrbit: Fotos orbitando en círculo 3D

#### Performance & UX
- Quality Manager con detección automática de dispositivo
- WebGL fallback con mensaje informativo
- Responsive design mobile-first
- Error boundaries en renderer
- Prefers-reduced-motion support
- Lazy loading de componentes pesados

#### Developer Experience
- TypeScript strict mode
- ESLint + Prettier configurados
- Testing con Vitest + Testing Library
- E2E testing con Playwright
- Documentación completa
- GitHub Actions para CI/CD
- Templates para Issues y PRs

#### Seguridad
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso por workspace
- Bucket storage con permisos configurados
- Validación de datos con Zod

### 🛠️ Technical Stack
- Next.js 16.3.5 con App Router
- React 19.2.8
- TypeScript 5.x
- Supabase (PostgreSQL + Auth + Storage)
- Three.js + React Three Fiber
- GSAP + Framer Motion
- shadcn/ui + Tailwind CSS
- Zustand para state management

### 📚 Documentación
- README completo con instrucciones de instalación
- Guía de contribución (CONTRIBUTING.md)
- Política de seguridad (SECURITY.md)
- Templates de Issues y PRs
- Documentación de arquitectura
- Guía de deployment en Vercel

### 🐛 Corregido
- N/A (primera release)

### 🔒 Seguridad
- Implementación inicial de RLS policies
- Validación de inputs en formularios
- Sanitización de outputs

---

## Tipos de Cambios

- `Added` - para nuevas funcionalidades
- `Changed` - para cambios en funcionalidades existentes
- `Deprecated` - para funcionalidades que serán removidas
- `Removed` - para funcionalidades removidas
- `Fixed` - para correcciones de bugs
- `Security` - para cambios relacionados con seguridad

[Unreleased]: https://github.com/boris13jbb/dedica-flow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/boris13jbb/dedica-flow/releases/tag/v0.1.0
