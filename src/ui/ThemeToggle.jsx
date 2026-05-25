import { useTheme } from '../context/ThemeContext.jsx'
import Icon from './Icon.jsx'

const labels = {
  light: { label: 'Claro', next: 'Cambiar a oscuro', icon: 'sun' },
  dark: { label: 'Oscuro', next: 'Cambiar a alto contraste', icon: 'moon' },
  hc: { label: 'Alto contraste', next: 'Cambiar a claro', icon: 'contrast' },
}

export default function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme()
  const meta = labels[theme] || labels.light
  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={meta.next}
      title={meta.next}
      className={`inline-flex min-h-touch min-w-touch items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none ${className}`}
    >
      <Icon name={meta.icon} size={16} label={meta.label} />
      <span className="hidden sm:inline">{meta.label}</span>
    </button>
  )
}
