# Checklist de Producción - DedicaStudio

## 📋 Pre-Deployment

### ✅ Código y Calidad

- [x] **Linting**: `npm run lint` pasa sin errores
- [x] **Type checking**: `npm run type-check` pasa sin errores
- [x] **Tests**: `npm run test` - todos los tests pasan
- [x] **Build**: `npm run build` completa exitosamente
- [ ] **Cobertura**: Tests cubren >80% del código crítico
- [x] **Código duplicado**: Eliminado
- [x] **Código muerto**: Eliminado
- [x] **Imports no usados**: Eliminados
- [x] **Console.logs**: Removidos o en development only

### 🔒 Seguridad

- [ ] **Variables de entorno**: Configuradas en plataforma de deployment
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **RLS Policies**: Activas y testeadas en todas las tablas
- [ ] **Storage Policies**: Configuradas correctamente
- [ ] **Auth Policies**: Validadas en backend
- [ ] **API Routes**: Protegidas con verificación de auth
- [ ] **CORS**: Configurado apropiadamente
- [ ] **CSP Headers**: Configurados (opcional pero recomendado)
- [ ] **Rate Limiting**: Implementado en endpoints críticos (opcional)

### 🗄️ Base de Datos

- [ ] **Migraciones**: Ejecutadas en Supabase production
  - `20260921000000_initial_schema.sql`
  - `20260921010000_storage_setup.sql`
- [ ] **Seed data**: Ejecutado si es necesario (solo para demo)
- [ ] **Índices**: Verificados en tablas críticas
- [ ] **Backups**: Configurados en Supabase
- [ ] **RLS**: Testeado con diferentes roles de usuario

### 🎨 Frontend

- [x] **Responsive**: Testeado en mobile, tablet, desktop
- [x] **WebGL Fallback**: Funciona correctamente
- [x] **Error Boundaries**: Implementados
- [x] **Loading States**: En todas las operaciones async
- [x] **Empty States**: Implementados
- [x] **Error Messages**: User-friendly y descriptivos
- [x] **Accesibilidad**: `prefers-reduced-motion` respetado
- [ ] **PWA**: Configurado (opcional)
- [ ] **Favicon**: Personalizado
- [ ] **OG Images**: Configuradas para social sharing

### 🚀 Performance

- [x] **Bundle size**: Optimizado (~600KB)
- [x] **Code splitting**: Automático por Next.js
- [x] **Image optimization**: next/image usado
- [x] **Quality manager**: Ajuste automático implementado
- [x] **Lazy loading**: Componentes pesados con Suspense
- [ ] **Lighthouse score**: >90 en todas las métricas
- [ ] **Core Web Vitals**: Dentro de rangos aceptables
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 📊 Monitoreo y Analytics

- [ ] **Error tracking**: Configurado (Sentry recomendado)
- [ ] **Analytics**: Configurado (opcional)
- [ ] **Performance monitoring**: Configurado
- [ ] **Logging**: Implementado para eventos críticos
- [ ] **Uptime monitoring**: Configurado (opcional)

### 📝 Documentación

- [x] **README**: Actualizado y completo
- [x] **PERFORMANCE.md**: Documentado
- [x] **TESTING.md**: Documentado
- [x] **API docs**: Documentadas (este archivo)
- [ ] **Changelog**: Inicializado
- [ ] **User guides**: Creadas (opcional)

## 🌐 Deployment - Vercel

### 1. Configuración Inicial

1. **Conectar repositorio**
   - Ir a [vercel.com](https://vercel.com)
   - New Project → Import Git Repository
   - Seleccionar el repositorio de DedicaStudio

2. **Configurar proyecto**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

3. **Variables de entorno**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 2. Configuración Avanzada

**vercel.json** (opcional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Deploy

```bash
# Primera vez
vercel

# Producción
vercel --prod

# Preview
git push origin feature-branch  # Auto-deploy preview
```

### 4. Post-Deploy

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar login/logout
- [ ] Crear un proyecto de prueba
- [ ] Verificar que las escenas se renderizan
- [ ] Probar upload de media
- [ ] Verificar publicación de experiencia
- [ ] Probar URL pública (`/p/[slug]`)
- [ ] Verificar responsive en mobile real
- [ ] Probar WebGL en diferentes navegadores

## 🐛 Deployment Alternativo - Render

Si prefieres Render:

1. **Crear Web Service**
   - New → Web Service
   - Conectar repositorio
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`
   - Environment: Node

2. **Variables de entorno**
   - Agregar las mismas variables que Vercel

3. **Configuración**
   - Auto-Deploy: Yes
   - Branch: main

## ✅ Post-Producción

### Monitoreo

```bash
# Verificar logs en Vercel
vercel logs

# Verificar analytics
vercel analytics
```

### Verificaciones Periódicas

- [ ] **Semanal**: Revisar error logs
- [ ] **Semanal**: Verificar performance metrics
- [ ] **Mensual**: Actualizar dependencias
- [ ] **Mensual**: Revisar RLS policies
- [ ] **Mensual**: Backup de base de datos

### Mantenimiento

```bash
# Actualizar dependencias (con cuidado)
npm outdated
npm update

# Actualizar Next.js
npm install next@latest react@latest react-dom@latest

# Regenerar Supabase types
npx supabase gen types typescript --project-id <tu-project-id> > src/types/supabase.ts
```

## 🚨 Rollback Plan

Si algo sale mal:

### Vercel
```bash
# Listar deployments
vercel ls

# Promover deployment anterior
vercel promote <deployment-url>
```

### Supabase
- Usar dashboard de Supabase para rollback de migraciones
- Restaurar desde backup si es necesario

## 📞 Soporte

### Recursos

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Three.js**: [threejs.org/docs](https://threejs.org/docs)

### Troubleshooting Común

#### Build falla en Vercel

```bash
# Verificar build local
npm run build

# Si falla, revisar:
# 1. TypeScript errors
# 2. Missing dependencies
# 3. Environment variables
```

#### RLS policies bloquean acceso

```sql
-- Temporalmente deshabilitar RLS para debug (NO en producción)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Re-habilitar
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

#### WebGL no funciona en producción

- Verificar que `WebGLFallback` está implementado
- Probar en diferentes navegadores
- Revisar logs de consola del cliente

## 📊 Métricas de Éxito

### KPIs Técnicos

- Uptime > 99.5%
- Response time < 500ms (p95)
- Error rate < 1%
- Build time < 2 minutos

### KPIs de Usuario

- Time to first render < 2s
- Experience creation < 5 min
- Media upload success > 99%
- Publication success > 99%

## 🎉 Launch Checklist

Antes del lanzamiento oficial:

- [ ] Todos los items de este checklist completados
- [ ] Tests E2E ejecutados en producción (staging)
- [ ] Load testing realizado
- [ ] Documentación de usuario lista
- [ ] Plan de comunicación definido
- [ ] Equipo de soporte preparado
- [ ] Rollback plan testeado
- [ ] Monitoring dashboards configurados
- [ ] Incident response plan documentado

---

**Última actualización**: Septiembre 21, 2026
**Versión**: 1.0.0
**Estado**: ✅ Listo para producción (pendiente deployment final)
