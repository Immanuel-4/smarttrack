import { MapPin } from 'lucide-react'

export default function PlusCodeChip({ code, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 bg-white text-zinc-900 font-mono border border-zinc-200 rounded-md ${sizeClass}`}>
      <MapPin size={size === 'lg' ? 14 : 12} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
      {code || '—'}
    </span>
  )
}
