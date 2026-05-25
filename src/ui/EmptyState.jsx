import Icon from './Icon.jsx'

/**
 * Estado vacío reutilizable. Patrón: icono · título · descripción · CTA.
 * Mantiene visibilidad de la información (no oculta indicadores) y aporta
 * acción contextual cuando aplica.
 */
export default function EmptyState({ icon = 'info', title, description, action, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-line bg-surface-inset text-ink-muted',
    info: 'border-info-soft bg-info-soft/40 text-info-fg',
    warning: 'border-warning-soft bg-warning-soft/60 text-warning-fg',
    success: 'border-ok-soft bg-ok-soft/60 text-ok-fg',
  }
  return (
    <div className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed p-6 text-center ${tones[tone] || tones.neutral}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-line">
        <Icon name={icon} size={22} />
      </div>
      {title && <p className="text-sm font-bold">{title}</p>}
      {description && <p className="text-xs font-medium opacity-80">{description}</p>}
      {action}
    </div>
  )
}
