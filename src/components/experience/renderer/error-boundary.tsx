'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ExperienceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Experience error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-50">
          <div className="max-w-md text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Error al cargar la experiencia</h2>
            <p className="text-zinc-400 mb-4">
              Hubo un problema al renderizar esta experiencia.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-red-400 mb-6 break-words font-mono bg-red-950/30 border border-red-900/40 rounded p-3">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-3 bg-zinc-100 text-zinc-900 hover:bg-white rounded-lg transition-colors"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
