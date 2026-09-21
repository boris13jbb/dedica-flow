import { NextRequest, NextResponse } from 'next/server'
import { deleteAsset } from '@/app/admin/projects/[id]/media/actions'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await deleteAsset(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al eliminar archivo' },
      { status: 500 }
    )
  }
}
