// Pill badge that displays a Plus Code in monospace font.
// size='lg' makes it larger for prominent pickup displays; default is compact.
export default function PlusCodeChip({ code, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
  return (
    <span className={`inline-flex items-center gap-1.5 bg-primary text-white font-mono font-semibold rounded-full ${sizeClass}`}>
      <span>📍</span>
      {code || '—'}
    </span>
  )
}
