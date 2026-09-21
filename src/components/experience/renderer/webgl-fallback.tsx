'use client'

import { useDeviceCapabilities } from '@/hooks'

interface WebGLFallbackProps {
  children: React.ReactNode
}

export function WebGLFallback({ children }: WebGLFallbackProps) {
  const { hasWebGL } = useDeviceCapabilities()

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-50 p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            WebGL no disponible
          </h2>
          <p className="text-zinc-400 mb-6">
            Tu navegador no soporta WebGL o está deshabilitado. Esta experiencia requiere WebGL para funcionar correctamente.
          </p>
          <p className="text-sm text-zinc-500">
            Intenta actualizar tu navegador o habilitar WebGL en la configuración.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
