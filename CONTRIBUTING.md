# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a DedicaFlow! Este documento te guiará a través del proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Mensajes de Commit](#mensajes-de-commit)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🎯 ¿Cómo Puedo Contribuir?

### Reportar Bugs

1. Verifica que el bug no haya sido reportado previamente en [Issues](https://github.com/boris13jbb/dedica-flow/issues)
2. Usa el template de bug report
3. Incluye toda la información solicitada en el template
4. Agrega capturas de pantalla si es posible

### Sugerir Mejoras

1. Revisa las [issues existentes](https://github.com/boris13jbb/dedica-flow/issues) para evitar duplicados
2. Usa el template de feature request
3. Explica claramente el problema que resuelve tu sugerencia
4. Proporciona ejemplos de uso si es posible

### Contribuir Código

1. Busca issues con las etiquetas `good first issue` o `help wanted`
2. Comenta en el issue que quieres trabajar en él
3. Espera la aprobación antes de comenzar el trabajo
4. Sigue el proceso de desarrollo descrito abajo

## 🛠️ Configuración del Entorno de Desarrollo

### Prerequisitos

- Node.js 18 o superior
- npm o pnpm
- Cuenta de Supabase (para desarrollo local)
- Git

### Instalación

```bash
# 1. Fork el repositorio en GitHub
# 2. Clona tu fork
git clone https://github.com/TU-USUARIO/dedica-flow.git
cd dedica-flow

# 3. Agrega el repositorio original como upstream
git remote add upstream https://github.com/boris13jbb/dedica-flow.git

# 4. Instala dependencias
npm install

# 5. Configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 6. Ejecuta las migraciones de base de datos
# (Ver README.md para instrucciones detalladas)

# 7. Inicia el servidor de desarrollo
npm run dev
```

## 🔄 Proceso de Desarrollo

### 1. Sincroniza tu Fork

```bash
git checkout main
git fetch upstream
git merge upstream/main
```

### 2. Crea una Rama

```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-del-bug
```

### 3. Desarrolla

- Escribe código limpio y bien documentado
- Sigue los estándares de código del proyecto
- Agrega tests para nueva funcionalidad
- Actualiza la documentación si es necesario

### 4. Ejecuta Tests

```bash
# Linter
npm run lint

# Type checking
npm run type-check

# Tests unitarios
npm test

# Tests E2E
npm run test:e2e

# Build
npm run build
```

### 5. Commit

```bash
git add .
git commit -m "tipo: descripción clara del cambio"
```

## 📝 Estándares de Código

### General

- TypeScript strict mode
- Componentes funcionales de React
- Hooks para manejo de estado
- Nombres descriptivos en español o inglés (consistente con el código existente)
- Comentarios solo cuando agregan valor (no obviedades)

### Estructura de Archivos

```
src/
├── app/              # Next.js App Router
├── components/       # Componentes React
│   ├── admin/       # Componentes del admin
│   ├── experience/  # Componentes de experiencias
│   └── ui/          # Componentes base (shadcn/ui)
├── hooks/           # Custom hooks
├── lib/             # Utilidades y helpers
├── stores/          # Zustand stores
└── types/           # Tipos TypeScript
```

### Estilo de Código

- **Indentación**: 2 espacios
- **Quotes**: Simples para strings
- **Semicolons**: Sí
- **Trailing commas**: Sí
- **Arrow functions**: Preferidas
- **Imports**: Organizados y sin duplicados

### React

```typescript
// ✅ Bueno
export function MyComponent({ title }: { title: string }) {
  const [state, setState] = useState(false)
  
  return <div>{title}</div>
}

// ❌ Malo
export default function myComponent(props: any) {
  // ...
}
```

### TypeScript

```typescript
// ✅ Bueno
interface UserData {
  id: string
  name: string
  email: string
}

// ❌ Malo
type UserData = {
  id: any
  name: any
}
```

## 📬 Mensajes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Formato, espaciado (no afecta el código)
- **refactor**: Refactorización (no agrega features ni arregla bugs)
- **perf**: Mejora de performance
- **test**: Agregar o corregir tests
- **chore**: Cambios en build, configuración, etc.

### Ejemplos

```bash
feat(editor): agregar soporte para drag & drop de escenas
fix(auth): corregir error en logout
docs(readme): actualizar instrucciones de instalación
refactor(components): simplificar lógica de SceneRenderer
```

## 🔀 Pull Requests

### Antes de Crear el PR

- [ ] Sincroniza tu rama con main
- [ ] Todos los tests pasan
- [ ] El código está formateado correctamente
- [ ] La documentación está actualizada
- [ ] No hay console.logs ni código de debug

### Creando el PR

1. Push tu rama a tu fork
2. Ve a GitHub y crea el Pull Request
3. Llena el template completo
4. Enlaza los issues relacionados
5. Espera la revisión

### Durante la Revisión

- Responde a los comentarios de manera constructiva
- Realiza los cambios solicitados en nuevos commits
- No hagas force push después de que se haya iniciado la revisión
- Mantén la conversación profesional y amigable

### Después de la Aprobación

- Tu PR será mergeado por un mantenedor
- Puedes eliminar tu rama después del merge
- ¡Gracias por tu contribución! 🎉

## 🎨 Agregando Nueva Escena 3D

Si quieres agregar una nueva escena:

1. Crea el componente en `src/components/experience/scenes/[nombre]/`
2. Implementa `SceneProps` interface
3. Registra en `scene-registry.ts`
4. Agrega al renderer en `scene-renderer.tsx`
5. Agrega tests básicos
6. Documenta las propiedades configurables

Ejemplo:

```typescript
// src/components/experience/scenes/mi-escena/MiEscena.tsx
import { SceneProps } from '@/types/experience'

export function MiEscena({ config }: SceneProps) {
  // Implementación
}

// src/components/experience/registry/scene-registry.ts
['miEscena', {
  type: 'miEscena',
  name: 'Mi Escena',
  description: 'Descripción de la escena',
  icon: 'Stars',
  defaultConfig: { /* config por defecto */ },
  editorFields: [ /* campos del inspector */ ],
}]
```

## 🐛 Debug y Troubleshooting

### Problemas Comunes

**Build falla**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Tests fallan**
```bash
npm run test -- --run
```

**TypeScript errors**
```bash
npm run type-check
```

**Supabase connection issues**
- Verifica tus variables de entorno
- Confirma que las migraciones se ejecutaron
- Revisa los logs en Supabase Dashboard

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de React](https://react.dev/)
- [Documentación de Supabase](https://supabase.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [shadcn/ui](https://ui.shadcn.com/)

## 💬 ¿Necesitas Ayuda?

- Abre un [issue](https://github.com/boris13jbb/dedica-flow/issues) con tus preguntas
- Revisa las [discusiones existentes](https://github.com/boris13jbb/dedica-flow/discussions)
- Lee la documentación completa en el README

---

**¡Gracias por contribuir a DedicaFlow!** 🚀
