'use client'

import { Monitor, Smartphone, Tablet } from 'lucide-react'

interface PreviewPanelProps {
  device: 'desktop' | 'tablet' | 'mobile'
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
}

export function PreviewPanel({ device, onDeviceChange }: PreviewPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-50">Preview</h2>
        
        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={`p-2 rounded transition-colors ${
              device === 'desktop'
                ? 'bg-zinc-700 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-50'
            }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => onDeviceChange('tablet')}
            className={`p-2 rounded transition-colors ${
              device === 'tablet'
                ? 'bg-zinc-700 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-50'
            }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={`p-2 rounded transition-colors ${
              device === 'mobile'
                ? 'bg-zinc-700 text-zinc-50'
                : 'text-zinc-400 hover:text-zinc-50'
            }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900/50 p-8 flex items-center justify-center">
        <div
          className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
            device === 'desktop'
              ? 'w-full h-full'
              : device === 'tablet'
              ? 'w-[768px] h-[1024px]'
              : 'w-[375px] h-[667px]'
          }`}
        >
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <p className="mb-2">Preview de experiencia</p>
              <p className="text-sm">(Próximamente)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
