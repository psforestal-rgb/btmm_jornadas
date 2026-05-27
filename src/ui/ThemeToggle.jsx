import { useTheme } from '../context/ThemeContext.jsx'
import { useT } from '../i18n/useT.js'
import Icon from './Icon.jsx'

const META = {
  light: { labelKey: 'theme.light', nextKey: 'theme.cambiarOscuro', icon: 'sun' },
  dark: { labelKey: 'theme.dark', nextKey: 'theme.cambiarHC', icon: 'moon' },
  hc: { labelKey: 'theme.hc', nextKey: 'theme.cambiarClaro', icon: 'contrast' },
}

export default function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme()
  const t = useT()
  const meta = META[theme] || META.light
  const label = t(meta.labelKey)
  const next = t(meta.nextKey)
  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={next}
      title={next}
      className={`inline-flex min-h-touch min-w-touch items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none ${className}`}
    >
      <Icon name={meta.icon} size={16} label={label} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
