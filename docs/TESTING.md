# Guía de Testing - DedicaStudio

## 📋 Resumen

DedicaStudio utiliza **Vitest** para tests unitarios y de integración, junto con **Testing Library** para tests de componentes React. Esta guía cubre todo lo necesario para ejecutar, escribir y mantener tests.

## 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests una vez
npm run test

# Modo watch (re-ejecuta automáticamente al cambiar archivos)
npm run test -- --watch

# Ejecutar tests con UI interactiva
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar solo tests que coincidan con un patrón
npm run test -- loader

# Ejecutar tests de un archivo específico
npm run test -- src/test/components/experience/loader.test.tsx

# Smoke E2E (login/admin, sin autenticación destructiva)
npm run test:e2e

# Scene Builder autenticado — requiere entorno aislado
npm run test:e2e:authenticated
```

## E2E: smoke vs autenticado

CI en PRs ejecuta **solo smoke**. Eso no cubre el Scene Builder.

`npm run test:e2e:authenticated` falla de forma explícita si falta un entorno aislado:

- `E2E_ISOLATED=1`
- `E2E_EMAIL` / `E2E_PASSWORD` de un usuario de pruebas (nunca admin de producción)
- `E2E_PROJECT_ID` / `E2E_PROJECT_SLUG` de un proyecto de pruebas (se rechaza `mayrita`)
- backend de test/staging (`NEXT_PUBLIC_SUPABASE_*` de ese entorno)

Los tests del Builder crean, reordenan y borran escenas, y pueden subir media. Deben restaurar el fixture con `try/finally`.

**Duplicar proyecto:** la app no tiene UI de eliminación de proyectos. El E2E real de duplicación solo corre con `E2E_ALLOW_PROJECT_MUTATIONS=1` y `SUPABASE_SERVICE_ROLE_KEY` del entorno de test, para borrar el clon. Sin eso, el flujo destructivo queda fuera de CI.

Mensaje oficial: `Authenticated E2E requires isolated test environment`.
No contar tests skipped como E2E ejecutados.

## 📁 Estructura de Tests

```
src/test/
├── setup.ts                          # Configuración global
├── components/
│   └── experience/
│       ├── loader.test.tsx           # Tests del loader
│       ├── webgl-fallback.test.tsx   # Tests de WebGL fallback
│       └── scene-registry.test.ts    # Tests del registro de escenas
├── hooks/
│   └── use-quality-manager.test.ts   # Tests del quality manager
└── stores/
    └── editor-store.test.ts          # Tests del store del editor
```

## ✅ Tests Implementados

### Componentes

#### ExperienceLoader (`loader.test.tsx`)
- ✅ Renderiza mensaje de carga
- ✅ Tiene clases de estilo correctas
- ✅ Renderiza spinner animado

#### WebGLFallback (`webgl-fallback.test.tsx`)
- ✅ Renderiza children cuando WebGL está disponible
- ✅ Muestra mensaje fallback cuando WebGL no está disponible

#### SceneRegistry (`scene-registry.test.ts`)
- ✅ Tiene todos los tipos de escena requeridos
- ✅ Tiene definiciones de escena válidas
- ✅ Tiene campos de editor con estructura correcta
- ✅ Tiene tipos de escena únicos
- ✅ Intro scene tiene configuración correcta
- ✅ Galaxy scene tiene configuración correcta

### Hooks

#### useDeviceCapabilities (`use-quality-manager.test.ts`)
- ✅ Detecta soporte de WebGL
- ✅ Detecta device pixel ratio
- ✅ Detecta dispositivos móviles
- ✅ Detecta prefers-reduced-motion

#### useQualityManager (`use-quality-manager.test.ts`)
- ✅ Retorna configuración con modo low
- ✅ Retorna configuración con modo medium
- ✅ Retorna configuración con modo high
- ✅ Ajusta calidad automáticamente en modo auto

### Stores

#### EditorStore (`editor-store.test.ts`)
- ✅ Inicializa con valores por defecto correctos
- ✅ Establece escena actual
- ✅ Establece campo seleccionado
- ✅ Marca como dirty
- ✅ Marca como clean y actualiza lastSaved

## 📊 Resultados

```
Test Files  5 passed (5)
Tests  24 passed (24)
Duration  ~1.5s
```

## 🛠️ Configuración

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Setup Global (src/test/setup.ts)

Mock automáticos configurados:
- ✅ `window.matchMedia`
- ✅ `IntersectionObserver`
- ✅ `ResizeObserver`
- ✅ WebGL context para three.js

## ✍️ Escribir Tests

### Test de Componente

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MiComponente } from '@/components/mi-componente'

describe('MiComponente', () => {
  it('should render correctly', () => {
    render(<MiComponente />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

### Test de Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMiHook } from '@/hooks/use-mi-hook'

describe('useMiHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMiHook())
    expect(result.current.value).toBe(0)
  })

  it('should update value', () => {
    const { result } = renderHook(() => useMiHook())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.value).toBe(1)
  })
})
```

### Test de Store (Zustand)

```typescript
import { create } from 'zustand'
import { describe, it, expect, beforeEach } from 'vitest'

const createTestStore = () => create(/* ... */)

describe('MiStore', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('should initialize correctly', () => {
    const state = store.getState()
    expect(state.value).toBe(0)
  })
})
```

### Test con Mocks

```typescript
import { vi } from 'vitest'

// Mock de módulo completo
vi.mock('@/hooks', () => ({
  useDeviceCapabilities: vi.fn(() => ({
    hasWebGL: true,
    dpr: 1,
  })),
}))

// Mock de función específica
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Mock de timer
vi.useFakeTimers()
vi.runAllTimers()
vi.useRealTimers()
```

## 🎯 Mejores Prácticas

### 1. Nombres Descriptivos

```typescript
// ❌ Malo
it('works', () => { ... })

// ✅ Bueno
it('should render loading message when data is fetching', () => { ... })
```

### 2. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should increment counter', () => {
  // Arrange
  const { result } = renderHook(() => useCounter())
  
  // Act
  act(() => {
    result.current.increment()
  })
  
  // Assert
  expect(result.current.count).toBe(1)
})
```

### 3. Tests Independientes

```typescript
// ❌ Malo - tests dependientes
let sharedState = 0

it('increments', () => {
  sharedState++
  expect(sharedState).toBe(1)
})

it('increments again', () => {
  sharedState++
  expect(sharedState).toBe(2) // falla si el test anterior falla
})

// ✅ Bueno - tests independientes
it('increments from 0 to 1', () => {
  const state = 0
  expect(state + 1).toBe(1)
})

it('increments from 5 to 6', () => {
  const state = 5
  expect(state + 1).toBe(6)
})
```

### 4. Cleanup Automático

```typescript
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Ya configurado en setup.ts
afterEach(() => {
  cleanup()
})
```

### 5. Testing de Accesibilidad

```typescript
import { render, screen } from '@testing-library/react'

it('should be accessible', () => {
  render(<Button>Click me</Button>)
  
  // Usar queries accesibles
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByRole('button')).toHaveAccessibleName('Click me')
})
```

## 🚫 Qué NO Testear

1. **Implementación de librerías externas**: No testees que `three.js` renderiza correctamente
2. **Detalles de implementación**: Testea comportamiento, no cómo se implementa
3. **Componentes triviales**: Un `<div>` con solo estilos no necesita tests
4. **Next.js internals**: No testees routing, SSR, etc. (usa E2E para eso)

## 📈 Cobertura de Código

### Generar Reporte

```bash
npm run test:coverage
```

Esto genera:
- Reporte en terminal
- HTML en `coverage/index.html`
- JSON en `coverage/coverage-final.json`

### Objetivos de Cobertura

| Tipo | Objetivo Mínimo |
|------|----------------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### Áreas Críticas (100% cobertura requerida)

- Quality Manager
- Error Boundary
- Scene Registry
- Editor Store
- Renderer Store

## 🐛 Debugging Tests

### Modo Debug

```bash
# Con breakpoints en VSCode
npm run test -- --inspect-brk

# Con Chrome DevTools
node --inspect-brk ./node_modules/.bin/vitest
```

### Ver Render

```typescript
import { render, screen, debug } from '@testing-library/react'

it('debug test', () => {
  const { debug: debugFn } = render(<Component />)
  
  // Imprime el DOM actual
  debugFn()
  
  // O usar screen.debug()
  screen.debug()
})
```

### Timeout Personalizado

```typescript
it('slow test', async () => {
  // Aumenta timeout para este test específico
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  }, { timeout: 5000 })
}, 10000) // timeout del test completo
```

## 🔄 CI/CD

### GitHub Actions (ejemplo)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Library Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## ✅ Checklist Pre-Commit

Antes de hacer commit, verifica:

- [ ] Todos los tests pasan (`npm run test`)
- [ ] Cobertura aceptable (`npm run test:coverage`)
- [ ] No hay warnings de deprecation
- [ ] Tests nuevos para features nuevas
- [ ] Tests actualizados si modificaste comportamiento
- [ ] Nombres de tests descriptivos
- [ ] Sin `it.only` o `describe.only` en el código
