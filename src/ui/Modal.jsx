import { useModalA11y } from '../lib/a11y.js'
import { t } from '../i18n/es-CR.js'
import Icon from './Icon.jsx'

/**
 * Wrapper accesible para modales: role="dialog", aria-modal, aria-labelledby,
 * trampa de foco, cierre con Esc y restauración de foco al disparador.
 *
 * Props:
 *  - open: si false, no renderiza nada.
 *  - onClose: callback al cerrar (Esc, backdrop, botón ✕).
 *  - title: título del modal (string).
 *  - description: descripción corta (string).
 *  - actions: footer (React node).
 *  - children: cuerpo.
 *  - size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' (default 'lg').
 *  - closeOnBackdrop: cerrar al clic fuera (default true).
 */
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
}

export default function Modal({
  open = true,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'lg',
  closeOnBackdrop = true,
  contentClassName = '',
}) {
  const { ref, titleId, descId } = useModalA11y({ open, onClose })
  if (!open) return null
  const maxW = sizeClasses[size] || sizeClasses.lg

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`flex max-h-[94vh] w-full ${maxW} flex-col overflow-hidden rounded-t-3xl bg-surface text-ink shadow-2xl outline-none md:rounded-3xl`}
      >
        {/* Asidero de hoja (bottom-sheet) — afordancia táctil en móvil. */}
        <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-line md:hidden" />
        {(title || description) && (
          <header className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-ink">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-sm text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("acciones.cerrar")}
              className="-mr-1 inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-alt hover:text-ink"
            >
              <Icon name="x" size={20} label={t("acciones.cerrar")} />
            </button>
          </header>
        )}
        <div className={`flex-1 overflow-y-auto p-5 ${contentClassName}`}>{children}</div>
        {actions && (
          <footer className="flex flex-wrap justify-between gap-2 border-t border-line bg-surface-alt p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {actions}
          </footer>
        )}
      </div>
    </div>
  )
}
