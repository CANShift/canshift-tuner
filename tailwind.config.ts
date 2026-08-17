import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import {
  BRAND_COLOR_KEY_TO_CSS_VAR,
  BRAND_DIVIDER_CSS_VAR,
  BRAND_NEUTRAL_STEPS,
  BRAND_TEXT_CSS_VAR,
  COLOR_KEY_TO_CSS_VAR,
  FONT_MONO_CSS_VAR,
  FONT_UI_CSS_VAR,
  brandNeutralCssVar,
} from '@canshift/core'

const cssVarReference = (cssVar: string): string => `hsl(var(${cssVar}) / <alpha-value>)`
const classNameFromCssVar = (cssVar: string): string => cssVar.replace(/^--/, '')

type ColorEntry = string | { DEFAULT: string; foreground: string }
const colorsFromTokens = (): Record<string, ColorEntry> => {
  const out: Record<string, ColorEntry> = {}
  for (const cssVar of Object.values(COLOR_KEY_TO_CSS_VAR)) {
    const fullClass = classNameFromCssVar(cssVar)
    const value = cssVarReference(cssVar)
    if (fullClass.endsWith('-foreground')) {
      const baseClass = fullClass.replace(/-foreground$/, '')
      const existing = out[baseClass]
      const baseDefault =
        typeof existing === 'object' && existing !== null
          ? existing.DEFAULT
          : (existing as string | undefined)
      if (baseDefault === undefined) {
        throw new Error(`Tailwind colors: '${fullClass}' has no matching base '${baseClass}'`)
      }
      out[baseClass] = { DEFAULT: baseDefault, foreground: value }
    } else {
      out[fullClass] = value
    }
  }
  return out
}

const brandColorsFromTokens = (): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const cssVar of Object.values(BRAND_COLOR_KEY_TO_CSS_VAR)) {
    out[classNameFromCssVar(cssVar)] = cssVarReference(cssVar)
  }
  for (const step of BRAND_NEUTRAL_STEPS) {
    out[classNameFromCssVar(brandNeutralCssVar(step))] = cssVarReference(brandNeutralCssVar(step))
  }
  out[classNameFromCssVar(BRAND_TEXT_CSS_VAR)] = cssVarReference(BRAND_TEXT_CSS_VAR)
  out[classNameFromCssVar(BRAND_DIVIDER_CSS_VAR)] = `var(${BRAND_DIVIDER_CSS_VAR})`
  return out
}

const UI_TOKEN_NAMES = [
  'bg',
  'panel',
  'ink',
  'muted',
  'faint',
  'line',
  'line-strong',
  'rule',
  'header-bg',
  'header-ink',
  'header-dim',
  'header-line',
  'accent',
  'accent-hover',
  'warning',
  'danger',
  'engaged',
  'ok',
  'console',
  'console-ink',
] as const

const uiColors = (): Record<string, string> =>
  Object.fromEntries(UI_TOKEN_NAMES.map((name) => [name, `var(--ui-${name})`]))

const TUNER_BRAND_CSS_VARS: Record<string, string> = {
  'brand-warning': '--brand-warning',
  'brand-accent-100': '--brand-accent-100',
  'brand-accent-700': '--brand-accent-700',
}

const tunerBrandColors = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(TUNER_BRAND_CSS_VARS).map(([name, cssVar]) => [name, cssVarReference(cssVar)])
  )

const COLOR_ALIASES: Record<string, string> = {
  background: cssVarReference(COLOR_KEY_TO_CSS_VAR.bg),
  input: cssVarReference(COLOR_KEY_TO_CSS_VAR.border),
}

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: `var(${FONT_UI_CSS_VAR})`,
        mono: `var(${FONT_MONO_CSS_VAR})`,
      },
      colors: {
        ...colorsFromTokens(),
        ...brandColorsFromTokens(),
        ...tunerBrandColors(),
        ...COLOR_ALIASES,
        ui: uiColors(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
