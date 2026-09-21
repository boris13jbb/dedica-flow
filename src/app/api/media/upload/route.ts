import { NextRequest, NextResponse } from 'next/server'
import { uploadAsset } from '@/app/admin/projects/[id]/media/actions'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const asset = await uploadAsset(projectId, {
      name: file.name,
      type: file.type,
      size: file.size,
      arrayBuffer,
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error al subir archivo' },
      { status: 500 }
    )
  }
}
