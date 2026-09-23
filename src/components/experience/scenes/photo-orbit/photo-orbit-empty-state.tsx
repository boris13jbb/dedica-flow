/**
 * Empty state solo para el editor/preview administrativo.
 * Nunca debe usarse en el renderer público publicado.
 */
export function PhotoOrbitEmptyState({
  variant = 'empty',
}: {
  variant?: 'empty' | 'invalid'
}) {
  const isInvalid = variant === 'invalid'

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-zinc-950 px-6 text-center text-zinc-300"
      data-testid="photo-orbit-empty-state"
      data-variant={variant}
    >
      <div>
        <p className="text-sm font-medium text-white">
          {isInvalid ? 'Este enlace no es una imagen' : 'No hay fotos'}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {isInvalid
            ? 'Los álbumes de Google Photos no se pueden cargar. Sube las fotos a Biblioteca o pega URLs directas (.jpg, .png, .webp).'
            : 'Agrega fotografías desde el inspector'}
        </p>
      </div>
    </div>
  )
}
