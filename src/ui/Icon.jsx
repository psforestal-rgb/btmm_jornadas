import {
  Home,
  Users,
  Calendar,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  BarChart3,
  Banknote,
  Shield,
  ShieldAlert,
  Bell,
  X,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  Stethoscope,
  FileText,
  MapPin,
  Pin,
  Flame,
  Trees,
  Scale,
  RefreshCw,
  Menu,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Contrast,
  TrafficCone,
  Wifi,
  WifiOff,
  Smartphone,
  Search,
  PlugZap,
} from 'lucide-react'

// Mapa centralizado: cada emoji original se mapea a un componente lucide.
// Componentes que aún no migraron pueden seguir usando el emoji literal.
const map = {
  '🏠': Home,
  '👥': Users,
  '📅': Calendar,
  '📊': BarChart3,
  '🗓️': CalendarDays,
  '📋': ClipboardList,
  '💵': Banknote,
  '🛡️': Shield,
  '🔔': Bell,
  '✕': X,
  '⚠️': AlertTriangle,
  '⚠': AlertTriangle,
  '🚨': AlertOctagon,
  '✅': CheckCircle2,
  '🩺': Stethoscope,
  '📄': FileText,
  '📍': MapPin,
  '🔥': Flame,
  '🌲': Trees,
  '⚖️': Scale,
  '⟳': RefreshCw,
  '☰': Menu,
  '▲': ChevronUp,
  '▼': ChevronDown,
  '←': ChevronLeft,
  '→': ChevronRight,
  '+': Plus,
  '🔒': Lock,
  '🔓': Unlock,
  '📴': WifiOff,
  '📡': PlugZap,
  '🚦': TrafficCone,
}

const aliases = {
  home: Home, users: Users, calendar: Calendar, calendarDays: CalendarDays,
  calendarClock: CalendarClock, clipboard: ClipboardList, chart: BarChart3,
  banknote: Banknote, shield: Shield, shieldAlert: ShieldAlert, bell: Bell,
  x: X, alert: AlertTriangle, danger: AlertOctagon, check: CheckCircle2,
  info: Info, stethoscope: Stethoscope, file: FileText, pin: MapPin,
  flame: Flame, trees: Trees, scale: Scale, refresh: RefreshCw, menu: Menu,
  chevronUp: ChevronUp, chevronDown: ChevronDown, chevronLeft: ChevronLeft,
  chevronRight: ChevronRight, plus: Plus, pencil: Pencil, trash: Trash2,
  lock: Lock, unlock: Unlock, eye: Eye, eyeOff: EyeOff, sun: Sun, moon: Moon,
  contrast: Contrast, traffic: TrafficCone, wifi: Wifi, wifiOff: WifiOff,
  phone: Smartphone, search: Search, pinMap: Pin, plugZap: PlugZap,
}

/**
 * Icono unificado: acepta un emoji literal (mapeado a un componente lucide)
 * o un alias por nombre. Mantiene la semántica del emoji original mientras
 * estandariza el renderizado entre dispositivos.
 *
 * Props:
 *  - name: emoji o alias (string).
 *  - size: número en px (default 18).
 *  - label: si está presente, anuncia el icono a lectores de pantalla;
 *           si no, el icono se marca aria-hidden.
 *  - className: extra clases tailwind.
 */
export default function Icon({ name, size = 18, label, className = '', strokeWidth = 2 }) {
  const Comp = (typeof name === 'string' ? (map[name] ?? aliases[name]) : null)
  if (!Comp) {
    // Fallback: emoji literal preserva semántica si no hay mapping.
    return (
      <span aria-hidden={label ? undefined : true} aria-label={label} className={className}>
        {name}
      </span>
    )
  }
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true, focusable: 'false' }
  return <Comp width={size} height={size} strokeWidth={strokeWidth} className={className} {...a11y} />
}
