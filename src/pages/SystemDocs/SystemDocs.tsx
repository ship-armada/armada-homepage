import { useEffect, useMemo, useState } from 'react'
import tokensCss from '@/styles/tokens.css?raw'
import overridesCss from '@/styles/theme-overrides.css?raw'
import { Button } from '@/components/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { TYPOGRAPHY_VARIANTS, typographyClassName } from '@/typography/variants'
import { ComponentPlayground } from './ComponentPlaygrounds'
import { MOTION_KEYFRAMES } from './motionInventory'
import {
  colorScaleOf,
  isHardcodedValue,
  parseDeclsForTheme,
} from './parseCssVars'
import styles from './SystemDocs.module.css'

const MISSING_DS =
  'This repo has no ARMADA_DESIGN_SYSTEM.md yet. Do not invent extra rules.'

const APP_RULES = [
  'Verify token names in src/styles/tokens.css before writing or editing UI.',
  'Follow accessibility-a11y.mdc — strictly apply A11Y.md for all frontend work.',
  'Never hardcode hex colors, raw px spacing/sizing, or font sizes — use CSS custom properties from src/styles/tokens.css. App-only roles live in src/styles/theme-overrides.css.',
  'Run npm run build before marking any task complete.',
  'This repo owns tokens and typography. Do not copy or overwrite them from another project.',
  'Never hand-edit typography.css or variants.ts. After changing semantic.typography in JSON, run npm run tokens:typography.',
  'CSS Modules per component (Component.module.css).',
  'Prefer semantic tokens (--semantic-*); use primitives when no semantic alias exists.',
  'Border radius and font-size primitives are unitless — wrap with calc(var(--token) * 1px).',
  'npm run build → npm run tokens:typography && tsc && vite build',
] as const

const NAV = [
  { href: '#foundations', label: 'Foundations' },
  { href: '#color', label: 'Color' },
  { href: '#typography', label: 'Typography' },
  { href: '#spacing', label: 'Spacing' },
  { href: '#radius', label: 'Radius & borders' },
  { href: '#gradient', label: 'Gradient' },
  { href: '#components', label: 'Components' },
  { href: '#motion', label: 'Motion' },
  { href: '#examples', label: 'Live examples' },
  { href: '#rules', label: 'Rules' },
  { href: '#agent', label: 'Agent guide' },
] as const

const PLAYGROUND_ORDER = [
  'Button',
  'IconButton',
  'Tag',
  'SegmentedControl',
  'Steps',
  'ThemeToggle',
  'TokenBadge',
  'Tooltip',
  'BalanceActionButton',
  'TextField',
  'TextArea',
  'ConfirmedScreenLayout',
] as const

const FEATURED_SEMANTIC = [
  '--semantic-color-surface-bg',
  '--semantic-color-surface-default',
  '--semantic-color-surface-raised',
  '--semantic-color-text-primary',
  '--semantic-color-text-secondary',
  '--semantic-color-text-muted',
  '--semantic-color-border-default',
  '--semantic-color-border-focus',
  '--semantic-color-brand-lavender',
  '--semantic-color-brand-amber',
  '--semantic-color-brand-action',
  '--semantic-color-brand-ink',
  '--semantic-color-status-success',
  '--semantic-color-status-warning',
  '--semantic-color-status-error',
  '--semantic-color-frost',
  '--semantic-color-frost-raised',
] as const

const componentIndexFiles = import.meta.glob('../../components/*/index.ts', { eager: true })

function componentFolders(): string[] {
  return Object.keys(componentIndexFiles)
    .map((path) => path.match(/components\/([^/]+)\/index\.ts$/)?.[1])
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b))
}

function sortScale(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const na = Number(a.replace(/[^\d]/g, ''))
    const nb = Number(b.replace(/[^\d]/g, ''))
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb
    return a.localeCompare(b)
  })
}

function useResolved(name: string, kind: 'color' | 'width' | 'font' | 'radius'): string {
  const [theme] = useTheme()
  const [value, setValue] = useState('')

  useEffect(() => {
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.visibility = 'hidden'
    el.style.pointerEvents = 'none'
    if (kind === 'color') el.style.background = `var(${name})`
    if (kind === 'width') el.style.width = `var(${name})`
    if (kind === 'font') el.style.fontSize = `calc(var(${name}) * 1px)`
    if (kind === 'radius') el.style.borderRadius = `calc(var(${name}) * 1px)`
    document.body.appendChild(el)
    const cs = getComputedStyle(el)
    if (kind === 'color') setValue(cs.backgroundColor)
    if (kind === 'width') setValue(cs.width)
    if (kind === 'font') setValue(cs.fontSize)
    if (kind === 'radius') setValue(cs.borderRadius)
    el.remove()
  }, [name, kind, theme])

  return value
}

function ColorSwatch({ name, declared }: { name: string; declared: string }) {
  const resolved = useResolved(name, 'color')
  const aliased = declared.includes('var(')
  return (
    <button
      type="button"
      className={styles.swatch}
      onClick={() => void navigator.clipboard.writeText(`var(${name})`)}
      aria-label={`Copy var(${name})`}
    >
      <div className={styles.chip} style={{ background: `var(${name})` }} />
      <span className={styles.swatchName}>{name.replace('--semantic-color-', '').replace('--primitives-color-', '')}</span>
      <span className={styles.meta}>{resolved}</span>
      {aliased ? <span className={styles.alias}>{declared}</span> : null}
    </button>
  )
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Array<[string, T[]]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return [...map.entries()]
}

export function SystemDocs() {
  const [theme] = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('foundations')
  const [motionPlay, setMotionPlay] = useState(0)

  const decls = useMemo(
    () => parseDeclsForTheme([tokensCss, overridesCss], theme),
    [theme],
  )

  const primitiveColors = [...decls.entries()]
    .filter(([name]) => name.startsWith('--primitives-color-'))
    .map(([name, declared]) => ({ name, declared }))

  const semanticColors = [...decls.entries()]
    .filter(([name]) => name.startsWith('--semantic-color-'))
    .map(([name, declared]) => ({ name, declared }))

  const featured = FEATURED_SEMANTIC.filter((name) => decls.has(name)).map((name) => ({
    name,
    declared: decls.get(name) ?? '',
  }))

  const hardcodedSemantic = semanticColors.filter((item) => isHardcodedValue(item.declared))

  const fontSizes = sortScale([...decls.keys()].filter((name) => name.startsWith('--primitives-fontSize-')))
  const spacings = sortScale([...decls.keys()].filter((name) => name.startsWith('--primitives-spacing-')))
  const radii = [...decls.keys()].filter((name) => name.includes('borderRadius'))
  const borders = [
    '--semantic-color-border-default',
    '--semantic-color-border-lavender',
    '--semantic-color-border-amber',
    '--semantic-color-border-focus',
  ].filter((name) => decls.has(name))

  const q = query.trim().toLowerCase()
  const folders = componentFolders()
  const playgrounds = PLAYGROUND_ORDER.filter((name) => folders.includes(name) && (!q || name.toLowerCase().includes(q)))
  const catalogRest = folders.filter(
    (name) => !PLAYGROUND_ORDER.includes(name as (typeof PLAYGROUND_ORDER)[number]) && (!q || name.toLowerCase().includes(q)),
  )
  const rules = APP_RULES.filter((rule) => !q || rule.toLowerCase().includes(q))

  useEffect(() => {
    const ids = NAV.map((item) => item.href.slice(1))
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActive(visible[0].target.id)
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 0.25, 0.5] },
    )
    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const gradientCss = `background: linear-gradient(
  to right,
  var(--semantic-color-brand-lavender),
  var(--semantic-color-brand-gradient-rose),
  var(--semantic-color-brand-amber)
);`

  const agentText = `AGENT GUIDE — Armada App
Source: .cursor/rules/armada-app.mdc

TOKEN DISCIPLINE
- Verify token names in src/styles/tokens.css before writing or editing UI.
- Never hardcode hex colors, raw px spacing/sizing, or font sizes — use CSS custom properties from src/styles/tokens.css. App-only roles live in src/styles/theme-overrides.css.
- Prefer semantic tokens (--semantic-*); use primitives when no semantic alias exists.
- Border radius and font-size primitives are unitless — wrap with calc(var(--token) * 1px).

WRONG
.card { background: #151416; padding: 20px; font-size: 15px; }

RIGHT
.card {
  background: var(--semantic-color-surface-default);
  padding: var(--primitives-spacing-5);
  font-size: calc(var(--primitives-fontSize-md) * 1px);
}

Check tokens.css before writing any var() reference.

CURSOR PROMPTS
Put CRITICAL constraints at the top. Name token vars explicitly.

Example:
CRITICAL: never hardcode hex/px/font-size. Use var(--semantic-color-surface-default) and var(--primitives-spacing-5). Check src/styles/tokens.css before any var().

BUILD
- npm run build before marking a task complete.
- npm run build → npm run tokens:typography && tsc && vite build
- npm run dev does not run tsc.

New HTML entry:
[ ] *.html
[ ] main-*.tsx
[ ] vite.config.ts rollupOptions.input
[ ] vercel.json route if needed

COMPONENT REUSE
Before building anything, scan #components on this page.

FIGMA MCP
not documented yet

WALLET SEAM
not documented yet in this repo’s design-system files
`

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#content">
        Skip to content
      </a>
      <header className={styles.topBar}>
        <h1 className={styles.topTitle}>System</h1>
        <label className={styles.meta} htmlFor="docs-search">
          Filter
        </label>
        <input
          id="docs-search"
          className={styles.search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Components and rules"
        />
        <ThemeToggle />
      </header>
      <div className={styles.shell}>
        <nav className={styles.sidebar} aria-label="Sections">
          <ul className={styles.navList}>
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  className={[styles.navLink, active === item.href.slice(1) ? styles.navLinkActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main id="content" className={styles.content}>
          <section id="foundations">
            <h2 className={styles.sectionTitle}>How to use this page</h2>
            <p className={styles.lead}>
              This is a catalog of tokens and components that already exist in the app. Prefer{' '}
              <code>--semantic-*</code> names. Click a color to copy <code>var(--token)</code>. Switch
              light and dark from the header — every specimen follows <code>data-theme</code>.
            </p>
            <p className={styles.note}>{MISSING_DS}</p>
          </section>

          <section id="color">
            <h2 className={styles.sectionTitle}>Color</h2>
            <p className={styles.lead}>
              Paint UI with semantic roles (surface, text, border, brand, status, frost). Primitive
              scales are the raw palette — use them only when no semantic token exists. Click a
              swatch to copy the CSS variable.
            </p>
            <h3 className={styles.subTitle}>Start here</h3>
            <div className={styles.grid}>
              {featured.map((item) => (
                <ColorSwatch key={item.name} name={item.name} declared={item.declared} />
              ))}
            </div>
            {hardcodedSemantic.length > 0 ? (
              <p className={styles.note}>
                Some semantic colors are written as raw values instead of <code>var(--primitives-…)</code>
                (ink, some status and overlay tokens). Prefer aliases when you add new ones. Click a
                swatch for the live computed color.
              </p>
            ) : null}

            <details className={styles.fold}>
              <summary>Full primitive scales</summary>
              {groupBy(primitiveColors, (item) => colorScaleOf(item.name) ?? 'other').map(([scale, items]) => (
                <div key={scale}>
                  <h4 className={styles.subTitle}>{scale}</h4>
                  <div className={styles.grid}>
                    {items.map((item) => (
                      <ColorSwatch key={item.name} name={item.name} declared={item.declared} />
                    ))}
                  </div>
                </div>
              ))}
            </details>

            <details className={styles.fold}>
              <summary>All semantic color tokens</summary>
              <div className={styles.grid}>
                {semanticColors.map((item) => (
                  <ColorSwatch key={item.name} name={item.name} declared={item.declared} />
                ))}
              </div>
            </details>
          </section>

          <section id="typography">
            <h2 className={styles.sectionTitle}>Typography</h2>
            <p className={styles.lead}>
              Page chrome on this site uses Geist. Charis SIL only appears in display composites
              below. Use <code>.armada-text-*</code> or the matching CSS variables. A written font
              pairing table is {MISSING_DS.toLowerCase()}
            </p>
            <h3 className={styles.subTitle}>Size scale</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Computed</th>
                  <th>Specimen</th>
                </tr>
              </thead>
              <tbody>
                {fontSizes.map((name) => (
                  <FontSizeRow key={name} name={name} />
                ))}
              </tbody>
            </table>
            <h3 className={styles.subTitle}>Composites</h3>
            {TYPOGRAPHY_VARIANTS.map((variant) => (
              <p key={variant} className={typographyClassName(variant)}>
                {variant}
              </p>
            ))}
          </section>

          <section id="spacing">
            <h2 className={styles.sectionTitle}>Spacing</h2>
            <p className={styles.lead}>
              Use these tokens for padding, gap, and offset. A written “rhythm” (zones vs items) is
              not in this repo yet.
            </p>
            {spacings.map((name) => (
              <SpacingRow key={name} name={name} />
            ))}
          </section>

          <section id="radius">
            <h2 className={styles.sectionTitle}>Radius and borders</h2>
            <p className={styles.lead}>
              Radius primitives are unitless — wrap with <code>calc(var(--token) * 1px)</code>.
            </p>
            <div className={styles.grid}>
              {radii.map((name) => (
                <RadiusCard key={name} name={name} declared={decls.get(name) ?? ''} />
              ))}
            </div>
            <div className={styles.grid}>
              {borders.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={styles.swatch}
                  onClick={() => void navigator.clipboard.writeText(`var(${name})`)}
                  aria-label={`Copy var(${name})`}
                >
                  <div className={styles.borderBox} style={{ borderColor: `var(${name})` }} />
                  <span className={styles.swatchName}>{name}</span>
                </button>
              ))}
            </div>
          </section>

          <section id="gradient">
            <h2 className={styles.sectionTitle}>Gradient</h2>
            <p className={styles.lead}>Brand gem wash stops from theme-overrides / brand tokens.</p>
            <div className={styles.gradientPreview} />
            <div className={styles.toolbar}>
              <Button
                variant="ghost"
                size="sm"
                showIcon={false}
                label="Copy CSS"
                onClick={() => void navigator.clipboard.writeText(gradientCss)}
              />
            </div>
            <pre className={styles.code}>{gradientCss}</pre>
          </section>

          <section id="components">
            <h2 className={styles.sectionTitle}>Components</h2>
            <p className={styles.lead}>
              Interactive families first. Everything else in <code>src/components/</code> is listed
              so you can reuse before inventing. Theme: header toggle. Hover and focus the live
              controls.
            </p>
            {playgrounds.map((name) => (
              <article key={name} className={styles.card} id={`component-${name}`}>
                <h3 className={styles.subTitle}>{name}</h3>
                <p className={styles.meta}>src/components/{name}/</p>
                <ComponentPlayground name={name} />
              </article>
            ))}
            <h3 className={styles.subTitle}>Also in the repo</h3>
            <p className={styles.lead}>Needs app context — open the source instead of a fake demo.</p>
            <ul className={styles.catalog}>
              {catalogRest.map((name) => (
                <li key={name}>
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="motion">
            <h2 className={styles.sectionTitle}>Motion</h2>
            <p className={styles.lead}>
              There is no shared motion scale yet besides <code>--semantic-motion-theme</code>.
              Enters in product CSS are ad hoc. This sample uses that duration token and{' '}
              <code>--primitives-spacing-10</code> travel.
            </p>
            <div className={styles.toolbar}>
              <Button
                variant="secondary"
                size="sm"
                showIcon={false}
                label="Replay enter"
                onClick={() => setMotionPlay((value) => value + 1)}
              />
              <div key={motionPlay} className={`${styles.motionBox} ${styles.motionBoxPlay}`} />
            </div>
            <details className={styles.fold}>
              <summary>All @keyframes found in src/</summary>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {MOTION_KEYFRAMES.map((item) => (
                    <tr key={`${item.file}-${item.name}`}>
                      <td>
                        <code>{item.name}</code>
                      </td>
                      <td className={styles.meta}>{item.file}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <section id="examples">
            <h2 className={styles.sectionTitle}>In the product</h2>
            <p className={styles.lead}>Real routes, not rebuilt mocks. Watch frost vs opaque panels.</p>
            <h3 className={styles.subTitle}>Dashboard</h3>
            <iframe className={styles.iframe} title="Dashboard" src="/dashboard.html" />
            <h3 className={styles.subTitle}>Pay via link</h3>
            <iframe className={styles.iframe} title="Pay via link" src="/pay-via-link.html" />
          </section>

          <section id="rules">
            <h2 className={styles.sectionTitle}>Rules</h2>
            <p className={styles.lead}>From .cursor/rules/armada-app.mdc, unparaphrased.</p>
            <ol className={styles.rulesList}>
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </section>

          <section id="agent">
            <h2 className={styles.sectionTitle}>Agent guide</h2>
            <p className={styles.lead}>For models working in this repo. Copy into a prompt if needed.</p>
            <pre className={styles.agent}>{agentText}</pre>
          </section>
        </main>
      </div>
    </div>
  )
}

function FontSizeRow({ name }: { name: string }) {
  const size = useResolved(name, 'font')
  return (
    <tr>
      <td>
        <code>{name}</code>
      </td>
      <td>{size}</td>
      <td style={{ fontSize: `calc(var(${name}) * 1px)` }}>Ag</td>
    </tr>
  )
}

function SpacingRow({ name }: { name: string }) {
  const px = useResolved(name, 'width')
  return (
    <div className={styles.spaceRow}>
      <div className={styles.spaceBar} style={{ width: `var(${name})` }} />
      <code className={styles.meta}>{name}</code>
      <span className={styles.meta}>{px}</span>
    </div>
  )
}

function RadiusCard({ name, declared }: { name: string; declared: string }) {
  const resolved = useResolved(name, 'radius')
  return (
    <button
      type="button"
      className={styles.swatch}
      onClick={() => void navigator.clipboard.writeText(`var(${name})`)}
      aria-label={`Copy var(${name})`}
    >
      <div className={styles.radiusBox} style={{ borderRadius: `calc(var(${name}) * 1px)` }} />
      <span className={styles.swatchName}>{name}</span>
      <span className={styles.meta}>{resolved}</span>
      {declared.includes('var(') ? <span className={styles.alias}>{declared}</span> : null}
    </button>
  )
}
