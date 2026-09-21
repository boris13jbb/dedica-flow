# ❓ Preguntas Frecuentes (FAQ)

## 📋 Índice

- [General](#general)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso y Funcionalidades](#uso-y-funcionalidades)
- [Desarrollo y Contribución](#desarrollo-y-contribución)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Seguridad](#seguridad)

---

## General

### ¿Qué es DedicaFlow?

DedicaFlow es una plataforma privada para crear, editar, previsualizar y publicar experiencias audiovisuales interactivas completamente personalizables usando tecnologías web modernas como React, Three.js y Next.js.

### ¿Para qué casos de uso está diseñado?

- Presentaciones interactivas inmersivas
- Galerías de fotos 3D
- Experiencias educativas
- Portfolios creativos
- Demos de productos
- Eventos virtuales
- Storytelling digital

### ¿Es gratuito?

Actualmente es un proyecto privado. Consulta la [LICENSE](LICENSE) para más detalles sobre el uso.

### ¿Qué tecnologías usa?

- **Frontend**: Next.js 16, React 19, TypeScript
- **3D**: Three.js, React Three Fiber
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS, shadcn/ui
- **Animaciones**: GSAP, Framer Motion

---

## Instalación y Configuración

### ¿Qué requisitos necesito?

```
- Node.js 18 o superior
- npm o pnpm
- Cuenta de Supabase (gratuita)
- 2GB de RAM mínimo
- Navegador moderno con WebGL
```

### ¿Cómo obtengo las credenciales de Supabase?

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings → API
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### ¿Dónde configuro las variables de entorno?

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### ¿Cómo ejecuto las migraciones?

```bash
# En el dashboard de Supabase SQL Editor, ejecuta:
# 1. supabase/migrations/20260921000000_initial_schema.sql
# 2. supabase/migrations/20260921010000_storage_setup.sql
# 3. supabase/seed.sql (opcional)
```

### ¿Puedo usar otra base de datos en lugar de Supabase?

Actualmente el proyecto está diseñado específicamente para Supabase. Para usar otra base de datos necesitarías:
- Reemplazar las queries de Supabase Client
- Reimplementar autenticación
- Configurar storage alternativo
- Adaptar las políticas RLS

---

## Uso y Funcionalidades

### ¿Qué escenas 3D están disponibles?

| Escena | Descripción |
|--------|-------------|
| Intro | Pantalla de bienvenida con partículas |
| Galaxy | Galaxia rotante con estrellas |
| Message | Mensajes animados personalizables |
| Finale | Pantalla final con opción de repetir |
| Nebula | Efecto nebulosa con partículas de color |
| Flowers | Flores 3D con múltiples modos |
| PhotoOrbit | Fotos orbitando en círculo 3D |

### ¿Cómo agrego una escena personalizada?

Ver la guía completa en [CONTRIBUTING.md](CONTRIBUTING.md#agregando-nueva-escena-3d).

Pasos básicos:
1. Crear componente en `src/components/experience/scenes/[nombre]/`
2. Registrar en `scene-registry.ts`
3. Agregar al `scene-renderer.tsx`
4. Documentar y testear

### ¿Puedo usar mis propias fuentes?

Sí, agrega tus fuentes en:
- `public/fonts/` para archivos de fuentes
- `src/app/layout.tsx` para importarlas
- Configura en `tailwind.config.js`

### ¿Cómo subo archivos multimedia?

1. Ve a `/admin/projects/[id]/media`
2. Haz clic en "Upload"
3. Selecciona imágenes, videos o audio
4. Los archivos se guardan automáticamente en Supabase Storage

### ¿Qué formatos de archivo son soportados?

- **Imágenes**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM
- **Audio**: MP3, WAV, OGG

### ¿Hay límite de tamaño de archivo?

Por defecto Supabase tiene límites:
- Free tier: 1GB total storage
- Pro tier: 100GB total storage

Puedes configurar límites personalizados en tu bucket.

---

## Desarrollo y Contribución

### ¿Cómo ejecuto los tests?

```bash
# Tests unitarios
npm test

# Tests con UI
npm run test:ui

# Tests E2E
npm run test:e2e

# Coverage
npm run test -- --coverage
```

### ¿Cómo ejecuto el linter?

```bash
npm run lint
```

### ¿Cómo verifico los tipos de TypeScript?

```bash
npm run type-check
```

### ¿Cómo contribuyo al proyecto?

Lee la guía completa en [CONTRIBUTING.md](CONTRIBUTING.md).

Pasos básicos:
1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Haz tus cambios
4. Ejecuta tests y linter
5. Commit: `git commit -m "feat: mi nueva feature"`
6. Push y abre un Pull Request

### ¿Qué convención de commits usamos?

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo de código
refactor: refactorización
test: agregar o corregir tests
chore: cambios en build o config
```

---

## Deployment

### ¿Dónde puedo deployar DedicaFlow?

Opciones recomendadas:
1. **Vercel** (recomendado) - Integración nativa con Next.js
2. **Netlify** - Alternativa sólida
3. **Railway** - Con soporte de Docker
4. **Render** - Tier gratuito disponible

### ¿Cómo despliego en Vercel?

```bash
# Opción 1: Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Opción 2: GitHub Integration
# 1. Conecta tu repo en vercel.com
# 2. Configura variables de entorno
# 3. Deploy automático
```

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para más detalles.

### ¿Qué variables de entorno necesito en producción?

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NODE_ENV=production
```

### ¿Funciona en otros hosting providers?

Sí, pero debes asegurarte de:
- Soporte de Next.js App Router
- Soporte de Edge Runtime (para middleware)
- Variables de entorno configuradas
- Build command: `npm run build`
- Start command: `npm start`

---

## Troubleshooting

### El build falla con errores de TypeScript

```bash
# Limpia y reinstala
rm -rf .next node_modules
npm install
npm run build
```

### "Cannot find module" en desarrollo

```bash
# Reinicia el dev server
npm run dev
```

### Las imágenes no cargan desde Supabase

Verifica:
1. Bucket storage existe y está público
2. RLS policies permiten lectura pública
3. URLs son correctas
4. Archivos fueron subidos correctamente

### WebGL no funciona en mi navegador

Verifica soporte de WebGL:
- Ve a [get.webgl.org](https://get.webgl.org/)
- Actualiza tu navegador
- Habilita aceleración de hardware
- Prueba en otro navegador

### La experiencia va lenta

Optimizaciones:
1. Reduce la calidad en Quality Manager
2. Usa menos partículas
3. Optimiza tamaño de imágenes
4. Reduce complejidad de escenas
5. Cierra otras pestañas/apps

### Errores de autenticación

```bash
# Verifica tus variables de entorno
# Revisa que las keys de Supabase sean correctas
# Confirma que el proyecto de Supabase está activo
```

### Tests fallan

```bash
# Ejecuta tests individuales
npm test -- path/to/test.test.ts

# Limpia caché
npm test -- --clearCache

# Modo verbose
npm test -- --verbose
```

---

## Seguridad

### ¿Es seguro exponer NEXT_PUBLIC_SUPABASE_ANON_KEY?

Sí, es seguro. Es una key pública diseñada para el cliente. La seguridad real está en:
- Row Level Security (RLS) policies
- Service role key (privada)
- Validación en backend

### ¿Cómo protejo mi SUPABASE_SERVICE_ROLE_KEY?

- **NUNCA** la commits en git
- Úsala solo en `.env.local` (gitignored)
- En producción: variables de entorno de Vercel
- No la expongas en el cliente

### ¿Qué son las RLS policies?

Row Level Security: reglas de seguridad a nivel de base de datos que controlan quién puede leer/escribir cada fila.

Ejemplo:
```sql
-- Solo el dueño del proyecto puede editarlo
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);
```

### ¿Cómo reporto una vulnerabilidad?

Lee nuestra [Política de Seguridad](SECURITY.md) y contacta de forma privada (no crear issue público).

---

## Performance

### ¿Cuántas escenas puedo agregar a una experiencia?

No hay límite técnico, pero recomendamos:
- **Óptimo**: 5-10 escenas
- **Máximo recomendado**: 20 escenas

Más escenas = mayor tiempo de carga inicial.

### ¿Qué tamaño de imágenes debo usar?

Recomendaciones:
- **Máximo**: 2048x2048px para texturas
- **Web optimizado**: 1920x1080px para fotos
- **Thumbnails**: 400x400px
- **Formato**: WebP o JPG (optimizado)

### ¿Cómo optimizo el performance?

1. Comprime imágenes antes de subir
2. Usa formatos modernos (WebP)
3. Limita número de partículas
4. Usa el Quality Manager
5. Implementa lazy loading

---

## Más Ayuda

### ¿Dónde puedo obtener más ayuda?

- 📚 [Documentación completa](README.md)
- 🐛 [Reportar un bug](https://github.com/boris13jbb/dedica-flow/issues/new?template=bug_report.md)
- 💡 [Solicitar una feature](https://github.com/boris13jbb/dedica-flow/issues/new?template=feature_request.md)
- 📖 [Guía de contribución](CONTRIBUTING.md)
- 🔒 [Política de seguridad](SECURITY.md)

### ¿Hay alguna comunidad?

Actualmente el proyecto es privado. Para consultas:
- [GitHub Issues](https://github.com/boris13jbb/dedica-flow/issues)
- [GitHub Discussions](https://github.com/boris13jbb/dedica-flow/discussions) (si está habilitado)

---

**¿No encontraste tu pregunta?** [Abre un issue](https://github.com/boris13jbb/dedica-flow/issues/new) con la etiqueta `question` 💬
