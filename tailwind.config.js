/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Tokens semánticos basados en CSS variables (definidas en index.css).
        // Cada token se resuelve a un color distinto según data-theme (light/dark/hc).
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          fg: 'rgb(var(--c-brand-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-brand-soft) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          alt: 'rgb(var(--c-surface-alt) / <alpha-value>)',
          inset: 'rgb(var(--c-surface-inset) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-ink-subtle) / <alpha-value>)',
          inverse: 'rgb(var(--c-ink-inverse) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        critical: {
          DEFAULT: 'rgb(var(--c-critical) / <alpha-value>)',
          fg: 'rgb(var(--c-critical-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-critical-soft) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--c-warning) / <alpha-value>)',
          fg: 'rgb(var(--c-warning-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-warning-soft) / <alpha-value>)',
        },
        ok: {
          DEFAULT: 'rgb(var(--c-ok) / <alpha-value>)',
          fg: 'rgb(var(--c-ok-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-ok-soft) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--c-info) / <alpha-value>)',
          fg: 'rgb(var(--c-info-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-info-soft) / <alpha-value>)',
        },
        viatico: {
          DEFAULT: 'rgb(var(--c-viatico) / <alpha-value>)',
          fg: 'rgb(var(--c-viatico-fg) / <alpha-value>)',
          soft: 'rgb(var(--c-viatico-soft) / <alpha-value>)',
        },
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}
