import { MapPin } from 'lucide-react'

export default function PlusCodeChip({ code, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-base px-3 py-2' : 'text-sm px-2.5 py-1.5'
  return (
    <span className={`inline-flex items-center gap-1.5 bg-white text-zinc-900 font-mono border border-zinc-200 rounded-md ${sizeClass}`}>
      <MapPin size={size === 'lg' ? 16 : 14} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
      {code || '—'}
    </span>
  )
}
