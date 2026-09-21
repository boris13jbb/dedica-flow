'use client'

export function ExperienceLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          {/* Spinning circles */}
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-zinc-400 animate-spin" />
          <div 
            className="absolute inset-2 rounded-full border-4 border-zinc-800 border-t-zinc-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1s' }}
          />
        </div>
        <p className="text-zinc-400 text-sm">Cargando experiencia...</p>
      </div>
    </div>
  )
}
