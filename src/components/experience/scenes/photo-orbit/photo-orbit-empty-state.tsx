/**
 * Empty state solo para el editor/preview administrativo.
 * Nunca debe usarse en el renderer público publicado.
 */
export function PhotoOrbitEmptyState() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-zinc-950 px-6 text-center text-zinc-300"
      data-testid="photo-orbit-empty-state"
    >
      <div>
        <p className="text-sm font-medium text-white">No hay fotos</p>
        <p className="mt-1 text-xs text-zinc-400">
          Agrega fotografías desde el inspector
        </p>
      </div>
    </div>
  )
}
