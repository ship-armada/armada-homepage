import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowDownTrayIcon, CheckIcon, Square2StackIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { FleetDownloadMenu } from '@/components/FleetDownloadMenu/FleetDownloadMenu'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Tooltip } from '@/components/Tooltip'
import { useBrandChromeFill } from '@/hooks/useBrandChromeFill'
import styles from './Brand.module.css'

const BASE = import.meta.env.BASE_URL

/**
 * Public brand values, matching the logo files.
 * Swatches are painted with theme colors; these strings are what visitors copy.
 */

type LogoId = 'full' | 'wordmark' | 'mark'

type LogoTab = {
  id: LogoId
  label: string
  title: string
  description: string
  src: string
  alt: string
}

const LOGO_TABS: LogoTab[] = [
  {
    id: 'full',
    label: 'Full logo',
    title: 'Full logo',
    description: 'The main version. Use it whenever there is enough space.',
    src: `${BASE}brand/armada-logo-full-dark.svg`,
    alt: 'Armada full logo',
  },
  {
    id: 'mark',
    label: 'Logomark',
    title: 'Logomark',
    description: 'The Sunrise. Used when space is tight.',
    src: `${BASE}brand/armada-symbol.svg`,
    alt: 'Armada Sunrise',
  },
  {
    id: 'wordmark',
    label: 'Wordmark',
    title: 'Wordmark',
    description: 'Part of the brand, as a tertiary application.',
    src: `${BASE}brand/armada-wordmark-white.svg`,
    alt: 'Armada wordmark',
  },
]

type BrandColor = {
  id: string
  name: string
  hex: string
  copyValue: string
  detail: string
  pip: ColorPip
}

type ColorPip = 'pipLavender' | 'pipRose' | 'pipAmber' | 'pipDeep' | 'pipAction'

const GRADIENT_STOPS: BrandColor[] = [
  {
    id: 'stop-lavender',
    name: 'Lavender',
    hex: '#CA8AEA',
    copyValue: '#CA8AEA',
    detail: '#CA8AEA',
    pip: 'pipLavender',
  },
  {
    id: 'stop-rose',
    name: 'Rose',
    hex: '#F39DB0',
    copyValue: '#F39DB0',
    detail: '#F39DB0',
    pip: 'pipRose',
  },
  {
    id: 'stop-amber',
    name: 'Amber',
    hex: '#F8D197',
    copyValue: '#F8D197',
    detail: '#F8D197',
    pip: 'pipAmber',
  },
]

const BRAND_COLORS: BrandColor[] = [
  {
    id: 'lavender',
    name: 'Lavender',
    hex: '#CA8AEA',
    copyValue: '#CA8AEA',
    detail: '#CA8AEA',
    pip: 'pipLavender',
  },
  {
    id: 'deep',
    name: 'Deep',
    hex: '#291433',
    copyValue: '#291433',
    detail: '#291433',
    pip: 'pipDeep',
  },
  {
    id: 'action',
    name: 'Action',
    hex: '#5227CA',
    copyValue: '#5227CA',
    detail: '#5227CA',
    pip: 'pipAction',
  },
]

const TYPEFACES = [
  {
    id: 'charis',
    name: 'Charis SIL',
    role: 'Used for headlines',
    face: 'faceCharis',
    href: 'https://fonts.google.com/download?family=Charis+SIL',
  },
  {
    id: 'geist',
    name: 'Geist',
    role: 'Used for interface and text',
    face: 'faceGeist',
    href: 'https://fonts.google.com/download?family=Geist',
  },
  {
    id: 'mono',
    name: 'Geist Mono',
    role: 'Used for numbers',
    face: 'faceMono',
    href: 'https://fonts.google.com/download?family=Geist+Mono',
  },
] as const

type FleetView = 'logo' | 'plain'

const FLEET_VIEWS: { id: FleetView; label: string }[] = [
  { id: 'logo', label: 'With logo' },
  { id: 'plain', label: 'No logo' },
]

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

const FLEET = [
  {
    id: 'fleet-1',
    title: 'Fleet 1',
    description: 'Primary fleet composition.',
    logo: {
      src: `${BASE}brand/fleet-logo-1.webp`,
      png: `${BASE}brand/fleet-logo-1.png`,
      alt: 'Armada fleet with the logo, first composition',
      pngName: 'Armada Fleet 1 with logo.png',
      webpName: 'Armada Fleet 1 with logo.webp',
      pngBytes: 11703317,
      webpBytes: 2186458,
    },
    plain: {
      src: `${BASE}brand/fleet-1.webp`,
      png: `${BASE}brand/fleet-1.png`,
      alt: 'Armada fleet without the logo, first composition',
      pngName: 'Armada Fleet 1.png',
      webpName: 'Armada Fleet 1.webp',
      pngBytes: 11686497,
      webpBytes: 1282002,
    },
  },
  {
    id: 'fleet-2',
    title: 'Fleet 2',
    description: 'Alternate fleet composition.',
    logo: {
      src: `${BASE}brand/fleet-logo-2.webp`,
      png: `${BASE}brand/fleet-logo-2.png`,
      alt: 'Armada fleet with the logo, second composition',
      pngName: 'Armada Fleet 2 with logo.png',
      webpName: 'Armada Fleet 2 with logo.webp',
      pngBytes: 10486308,
      webpBytes: 1529932,
    },
    plain: {
      src: `${BASE}brand/fleet-2.webp`,
      png: `${BASE}brand/fleet-2.png`,
      alt: 'Armada fleet without the logo, second composition',
      pngName: 'Armada Fleet 2.png',
      webpName: 'Armada Fleet 2.webp',
      pngBytes: 10472394,
      webpBytes: 528028,
    },
  },
] as const

function ColorChip({ color }: { color: BrandColor }) {
  return (
    <span className={styles.chip}>
      <span className={styles.chipName}>{color.name}</span>
      <span className={styles.chipHead}>
        <span className={`${styles.pip} ${styles[color.pip]}`} aria-hidden />
        <span className={styles.chipHex}>{color.detail}</span>
      </span>
    </span>
  )
}

export function Brand() {
  useBrandChromeFill()

  const tabsId = useId()
  const fleetTabsId = useId()
  const [logoId, setLogoId] = useState<LogoId>('full')
  const [displayedLogo, setDisplayedLogo] = useState<LogoId>('full')
  const [logoPhase, setLogoPhase] = useState<'shown' | 'leaving' | 'entering'>('shown')
  const [fleetView, setFleetView] = useState<FleetView>('logo')
  const [notice, setNotice] = useState('')
  const [copiedSvg, setCopiedSvg] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const fleetTabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const noticeTimer = useRef<number | null>(null)
  const logoTarget = useRef<LogoId>('full')
  const previewRef = useRef<HTMLDivElement>(null)

  const logo = LOGO_TABS.find((tab) => tab.id === logoId) ?? LOGO_TABS[0]
  const shownLogo = LOGO_TABS.find((tab) => tab.id === displayedLogo) ?? LOGO_TABS[0]

  useEffect(() => {
    return () => {
      if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (logoPhase !== 'leaving') return
    const piece = previewRef.current?.querySelector<HTMLElement>('[data-piece="word"], [data-piece="solo"]')
    const styles = piece ? getComputedStyle(piece) : null
    const toMs = (value: string) => {
      const first = value.split(',')[0]?.trim() ?? ''
      const amount = parseFloat(first)
      if (!Number.isFinite(amount)) return 0
      return first.endsWith('ms') ? amount : amount * 1000
    }
    const duration = styles ? toMs(styles.transitionDuration) : 0
    const delay = styles ? toMs(styles.transitionDelay) : 0
    const timer = window.setTimeout(() => {
      setDisplayedLogo(logoTarget.current)
      setLogoPhase('entering')
    }, (Number.isFinite(duration) ? duration : 0) + (Number.isFinite(delay) ? delay : 0))
    return () => window.clearTimeout(timer)
  }, [logoPhase])

  useEffect(() => {
    if (logoPhase !== 'entering') return
    let second = 0
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setLogoPhase('shown'))
    })
    return () => {
      window.cancelAnimationFrame(first)
      window.cancelAnimationFrame(second)
    }
  }, [logoPhase])

  useEffect(() => {
    if (logoPhase === 'shown' && displayedLogo !== logoTarget.current) {
      setLogoPhase('leaving')
    }
  }, [logoPhase, displayedLogo])

  function announce(message: string) {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
    setNotice('')
    window.requestAnimationFrame(() => setNotice(message))
    noticeTimer.current = window.setTimeout(() => {
      setNotice('')
      setCopiedSvg(false)
    }, 2000)
  }

  async function copySvg() {
    try {
      const response = await fetch(logo.src)
      if (!response.ok) throw new Error('Could not read the logo file')
      const svg = await response.text()
      await navigator.clipboard.writeText(svg)
      setCopiedSvg(true)
      announce(`Copied ${logo.title} SVG`)
    } catch {
      setCopiedSvg(false)
      announce('Could not copy the SVG.')
    }
  }

  async function copyColor(color: BrandColor) {
    try {
      await navigator.clipboard.writeText(color.copyValue)
      announce(`Copied ${color.name} ${color.copyValue}`)
    } catch {
      announce(`Could not copy ${color.name}. The value is ${color.copyValue}.`)
    }
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = LOGO_TABS.length - 1
    let next = index
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    const nextTab = LOGO_TABS[next]
    if (!nextTab) return
    showLogo(nextTab.id)
    tabRefs.current[next]?.focus()
  }

  function showLogo(next: LogoId) {
    if (next === logoTarget.current && displayedLogo === next && logoPhase === 'shown') return
    setCopiedSvg(false)
    setLogoId(next)
    logoTarget.current = next
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedLogo(next)
      setLogoPhase('shown')
      return
    }
    if (logoPhase === 'shown') setLogoPhase('leaving')
  }

  function onFleetTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = FLEET_VIEWS.length - 1
    let next = index
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return
    event.preventDefault()
    const nextTab = FLEET_VIEWS[next]
    if (!nextTab) return
    setFleetView(nextTab.id)
    fleetTabRefs.current[next]?.focus()
  }

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <SiteHeader tone="ink" />
      <main id="main-content" className={styles.main}>
        <div className={styles.content}>
          <p className={styles.live} role="status" aria-live="polite">
            {notice}
          </p>

          <header className={styles.intro}>
            <h1 className={`armada-text-title ${styles.title}`}>Armada Brand</h1>
            <a
              className={`armada-text-ui-button ${styles.kitButton}`}
              href={`${BASE}brand/armada-brand-kit.zip`}
              download="Armada Brand Kit.zip"
            >
              <ArrowDownTrayIcon aria-hidden width={20} height={20} />
              Download Kit
            </a>
          </header>

          <section aria-label="Logo">
            <div className={styles.stage}>
              <div className={styles.copyWrap}>
                <Tooltip variant="centered" content="Copy SVG">
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => void copySvg()}
                    aria-label={copiedSvg ? `Copied ${logo.title} SVG` : `Copy ${logo.title} SVG`}
                  >
                    {copiedSvg ? (
                      <CheckIcon aria-hidden width={20} height={20} />
                    ) : (
                      <Square2StackIcon aria-hidden width={20} height={20} />
                    )}
                  </button>
                </Tooltip>
              </div>
              <div
                ref={previewRef}
                className={styles.previewSlot}
                role="tabpanel"
                id={`${tabsId}-panel`}
                aria-labelledby={`${tabsId}-tab-${logo.id}`}
                data-phase={logoPhase}
                data-logo={displayedLogo}
              >
                {displayedLogo === 'full' ? (
                  <div className={styles.fullLogo}>
                    <img
                      className={`${styles.logoPiece} ${styles.fullSymbol}`}
                      data-piece="symbol"
                      src={`${BASE}brand/armada-symbol.svg`}
                      alt=""
                    />
                    <img
                      className={`${styles.logoPiece} ${styles.fullWord}`}
                      data-piece="word"
                      src={`${BASE}brand/armada-wordmark-white.svg`}
                      alt={logoPhase === 'leaving' ? '' : 'Armada full logo'}
                    />
                  </div>
                ) : (
                  <img
                    className={`${styles.logoPiece} ${displayedLogo === 'mark' ? styles.previewMark : styles.previewWord}`}
                    data-piece="solo"
                    src={shownLogo.src}
                    alt={logoPhase === 'leaving' ? '' : shownLogo.alt}
                  />
                )}
              </div>

              <div className={styles.tabs}>
                <div className={styles.tabList} role="tablist" aria-label="Logo variations">
                  {LOGO_TABS.map((tab, index) => {
                    const selected = tab.id === logo.id
                    return (
                      <button
                        key={tab.id}
                        ref={(node) => {
                          tabRefs.current[index] = node
                        }}
                        type="button"
                        className={styles.tab}
                        role="tab"
                        id={`${tabsId}-tab-${tab.id}`}
                        aria-selected={selected}
                        aria-controls={`${tabsId}-panel`}
                        aria-describedby={selected ? `${tabsId}-note` : undefined}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => showLogo(tab.id)}
                        onKeyDown={(event) => onTabKeyDown(event, index)}
                      >
                        <span className={styles.tabLabel}>{tab.label}</span>
                        <span className={styles.tabRule} aria-hidden>
                          <span className={styles.tabRuleFill} />
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className={styles.tabNotes}>
                  <p
                    id={`${tabsId}-note`}
                    className={`armada-text-detail ${styles.tabNote}`}
                    data-slot={logo.id}
                  >
                    {logo.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="colors-heading">
            <div className={styles.sectionHead}>
              <h2 id="colors-heading" className={`armada-text-display-lg ${styles.sectionTitle}`}>
                Colors
              </h2>
              <p className={`armada-text-body ${styles.sectionLede}`}>
                The gradient is the brand’s signature. Lavender is the primary color, for backgrounds and accents. Deep is the dark background. Action is reserved for calls to action.
              </p>
            </div>
            <ul className={styles.bento} aria-label="Brand colors">
              <li className={styles.gradient}>
                <div className={styles.gradientFace}>
                  <div className={`${styles.chip} ${styles.gradientCard}`}>
                    <span className={styles.chipName}>Sunrise Gradient</span>
                    <div className={styles.stopRow} role="group" aria-label="Sunrise Gradient">
                      {GRADIENT_STOPS.map((stop) => (
                        <button
                          key={stop.id}
                          type="button"
                          className={styles.stop}
                          onClick={() => void copyColor(stop)}
                          aria-label={`Copy ${stop.name} ${stop.copyValue}`}
                        >
                          <span className={styles.chipHead}>
                            <span className={`${styles.pip} ${styles[stop.pip]}`} aria-hidden />
                            <span className={styles.chipHex}>{stop.detail}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
              {BRAND_COLORS.map((color) => (
                <li key={color.id} className={styles[color.id as ColorArea]}>
                  <button
                    type="button"
                    className={styles.swatch}
                    onClick={() => void copyColor(color)}
                    aria-label={`Copy ${color.name} ${color.copyValue}`}
                  >
                    <ColorChip color={color} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="type-heading">
            <div className={styles.sectionHead}>
              <h2 id="type-heading" className={`armada-text-display-lg ${styles.sectionTitle}`}>
                Typography
              </h2>
              <p className={`armada-text-body ${styles.sectionLede}`}>
                Charis SIL for headlines. Geist for the interface and the text. Geist Mono for numbers.
              </p>
            </div>
            <ul className={styles.typeGrid}>
              {TYPEFACES.map((face) => (
                <li key={face.id}>
                  <div className={styles.typeCard}>
                    <span className={`${styles.specimen} ${styles[face.face]}`} aria-hidden>
                      A
                    </span>
                    <span className={styles.typeMeta}>
                      <span className={`armada-text-ui-heading-lg ${styles.typeName}`}>{face.name}</span>
                      <span className={`armada-text-detail ${styles.typeRole}`}>{face.role}</span>
                    </span>
                    <div className={styles.typeDownload}>
                      <Tooltip variant="centered" content="Download">
                        <a
                          className={styles.typeDownloadBtn}
                          href={face.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download ${face.name}, opens in a new tab`}
                        >
                          <ArrowDownTrayIcon aria-hidden width={20} height={20} />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="use-heading">
            <div className={styles.sectionHead}>
              <h2 id="use-heading" className={`armada-text-display-lg ${styles.sectionTitle}`}>
                Using the mark
              </h2>
              <p className={`armada-text-body ${styles.sectionLede}`}>
                The full logo is the primary application, especially outside Armada. Keep the gradient on a dark ground, at high contrast.
              </p>
            </div>

            <h3 className={`armada-text-ui-heading-sm ${styles.practiceTitle}`}>Best practices</h3>
            <ul className={styles.useList}>
              <li>
                <CheckCircleIcon aria-hidden width={20} height={20} />
                <span>Lead with the full logo, above all outside Armada.</span>
              </li>
              <li>
                <CheckCircleIcon aria-hidden width={20} height={20} />
                <span>Set the gradient only on a dark ground, at high contrast.</span>
              </li>
              <li>
                <CheckCircleIcon aria-hidden width={20} height={20} />
                <span>On any other ground, use the logo in white or in dark.</span>
              </li>
              <li>
                <CheckCircleIcon aria-hidden width={20} height={20} />
                <span>Keep clear space around the mark.</span>
              </li>
            </ul>

            <ul className={styles.exampleGrid}>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleDeep}`} aria-hidden>
                    <img className={styles.markLogo} src={`${BASE}brand/armada-logo-full-dark.svg`} alt="" />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Gradient on Deep.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleDeep}`} aria-hidden>
                    <span className={`${styles.monoLogo} ${styles.monoOnDark}`} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    White, when the gradient is not used.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={`${styles.monoLogo} ${styles.monoDeep}`} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Dark, on a light ground.
                  </figcaption>
                </figure>
              </li>
            </ul>

            <h3 className={`armada-text-ui-heading-sm ${styles.practiceTitle} ${styles.avoidTitle}`}>Avoid</h3>
            <ul className={styles.avoidGrid}>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={`${styles.monoLogo} ${styles.monoMuted} ${styles.markStretch}`} />
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Stretching the mark.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={`${styles.monoLogo} ${styles.monoMuted} ${styles.markTurn}`} />
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>Rotating the mark.</figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={styles.cropWindow}>
                      <span className={`${styles.monoLogo} ${styles.monoMuted} ${styles.markCrop}`} />
                    </span>
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Cropping into the logo.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={`${styles.monoLogo} ${styles.monoMuted} ${styles.markShadow}`} />
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Adding a shadow.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <span className={styles.wordChange}>
                      <span className={`${styles.symbolMark} ${styles.monoMuted}`} />
                      <span className={styles.fakeWord}>Armada</span>
                    </span>
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Changing the wordmark.
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure className={styles.example}>
                  <div className={`${styles.exampleStage} ${styles.exampleLight}`} aria-hidden>
                    <svg className={styles.recolorLogo} viewBox="0 0 132 32" aria-hidden>
                      <g className={styles.recolorMark}>
                        <path d="M16.0001 32L13.405 29.405H18.5951L16.0001 32Z" />
                        <path d="M20.3249 27.6752H11.6752L9.51334 25.5134H22.4868L20.3249 27.6752Z" />
                        <path d="M16.0005 23.7837H7.78361L5.62103 21.6211H13.8379L16.0005 23.7837Z" />
                        <path d="M24.2164 23.7837H16.0009L18.1634 21.6211H26.379L24.2164 23.7837Z" />
                        <path d="M12.1081 19.8914H3.8913L1.72943 17.7296H9.94628L12.1081 19.8914Z" />
                        <path d="M28.1087 19.8914H19.8932L22.055 17.7296H30.2706L28.1087 19.8914Z" />
                        <path d="M32 15.9997H23.7845L16.0007 8.21604L8.21685 15.9997H0L16.0001 0L32 15.9997Z" />
                      </g>
                      <path className={styles.recolorLight} d="M54.5439 23.9917H51.5312L50.4043 20.4985H45.8184L44.9795 17.896H49.5645L47.2725 10.7837L44.9795 17.896L43.0146 23.9917H40L45.502 8.0083H49.042L54.5439 23.9917Z" />
                      <path className={styles.recolorDark} d="M62.4424 8.0083C63.5382 8.00834 64.5015 8.2097 65.3301 8.61279C66.1601 9.01591 66.7987 9.5882 67.248 10.3257C67.6975 11.0648 67.9219 11.898 67.9219 12.8267C67.9219 13.7553 67.6857 14.6083 67.2139 15.3384C66.8193 15.9489 66.2924 16.4427 65.6367 16.8247C66.2683 17.2309 66.7727 17.7419 67.1465 18.3628C67.6183 19.1467 67.8545 20.034 67.8545 21.0239V23.9917H64.9775V21.0239C64.9775 20.3999 64.8546 19.8639 64.6113 19.4146C64.368 18.9652 64.0023 18.6231 63.5156 18.3872C63.0289 18.1513 62.4346 18.0327 61.7344 18.0327H58.9717V23.9917H56.1416V8.0083H62.4424ZM58.9717 15.52H62.1006C62.6945 15.52 63.2078 15.4286 63.6406 15.2466C64.0751 15.0644 64.4096 14.7943 64.6455 14.436C64.8814 14.0792 65 13.618 65 13.0552C65 12.4923 64.8814 12.0274 64.6455 11.6616C64.4097 11.2961 64.0861 11.0224 63.6758 10.8403C63.2652 10.6582 62.7766 10.5679 62.2139 10.5679H58.9717V15.52Z" />
                      <path className={styles.recolorLight} d="M73.3135 8.01611L73.3379 8.0083L77.916 19.6421L82.4951 8.0083L82.5439 8.02393L82.541 8.0083H85.8291V23.9917H83.1797V12.73L78.7734 23.9917H77.0391L72.6523 12.6987V23.9907H70.0039V8.0083H73.3154L73.3135 8.01611Z" />
                      <path className={styles.recolorDark} d="M101.966 23.9917H98.9521L97.8252 20.4985H93.2402L92.4004 17.896H96.9863L94.6943 10.7837L92.4004 17.896L90.4346 23.9917H87.4209L92.9229 8.0083H96.4639L101.966 23.9917Z" />
                      <path className={styles.recolorLight} d="M109.066 8.0083C110.619 8.00835 111.973 8.35906 113.13 9.05908C114.287 9.75931 115.178 10.715 115.802 11.9243C116.426 13.1351 116.737 14.4926 116.737 16.0005C116.737 17.5083 116.426 18.8659 115.802 20.0767C115.178 21.2876 114.286 22.2416 113.13 22.9419C111.973 23.6421 110.619 23.9916 109.066 23.9917H103.562V8.0083H109.066ZM106.394 21.2974H106.395V20.9546C106.395 21.183 106.509 21.2974 106.737 21.2974H108.838C109.872 21.2973 110.767 21.0686 111.521 20.6118C112.275 20.1549 112.845 19.5274 113.233 18.7271C113.622 17.9268 113.815 17.0192 113.815 15.9995C113.815 14.9799 113.621 14.0707 113.233 13.272C112.845 12.4732 112.275 11.8441 111.521 11.3872C110.767 10.9304 109.872 10.7017 108.838 10.7017H106.394V21.2974Z" />
                      <path className={styles.recolorDark} d="M125.83 8.0083L131.333 23.9917H128.318L127.193 20.4985H122.607L121.769 17.896H126.354L124.061 10.7837L121.769 17.896L119.802 23.9917H116.789L122.291 8.0083H125.83Z" />
                    </svg>
                    <XCircleIcon className={styles.avoidMark} aria-hidden width={24} height={24} />
                  </div>
                  <figcaption className={`armada-text-detail ${styles.exampleCaption}`}>
                    Using other colors.
                  </figcaption>
                </figure>
              </li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="fleet-heading">
            <div className={styles.sectionHead}>
              <h2 id="fleet-heading" className={`armada-text-display-lg ${styles.sectionTitle}`}>
                Fleet
              </h2>
              <p className={`armada-text-body ${styles.sectionLede}`}>
                Signature fleet imagery. Use the frame as provided.
              </p>
            </div>
            <div className={styles.fleetTabs} role="tablist" aria-label="Fleet versions">
              {FLEET_VIEWS.map((tab, index) => {
                const selected = tab.id === fleetView
                return (
                  <button
                    key={tab.id}
                    ref={(node) => {
                      fleetTabRefs.current[index] = node
                    }}
                    type="button"
                    className={styles.fleetTab}
                    role="tab"
                    id={`${fleetTabsId}-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`${fleetTabsId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setFleetView(tab.id)}
                    onKeyDown={(event) => onFleetTabKeyDown(event, index)}
                  >
                    <span className={styles.fleetTabLabel}>{tab.label}</span>
                    <span className={styles.fleetTabRule} aria-hidden>
                      <span className={styles.fleetTabRuleFill} />
                    </span>
                  </button>
                )
              })}
            </div>
            <ul className={styles.fleet} role="tabpanel" id={`${fleetTabsId}-panel`} aria-labelledby={`${fleetTabsId}-tab-${fleetView}`}>
              {FLEET.map((item) => {
                const file = item[fleetView]
                const version = fleetView === 'logo' ? 'with logo' : 'without logo'
                return (
                  <li key={item.id} className={styles.fleetCard}>
                    <img
                      className={styles.fleetImage}
                      src={file.src}
                      alt={file.alt}
                      width={4096}
                      height={2286}
                    />
                    <div className={styles.fleetBody}>
                      <div className={styles.fleetCopy}>
                        <h3 className={`armada-text-ui-heading-sm ${styles.fleetTitle}`}>{item.title}</h3>
                        <p className={`armada-text-body ${styles.fleetDesc}`}>{item.description}</p>
                      </div>
                      <FleetDownloadMenu
                        key={`${item.id}-${fleetView}`}
                        label={`Download ${item.title} ${version}`}
                        options={[
                          {
                            id: 'png',
                            label: 'PNG',
                            size: formatFileSize(file.pngBytes),
                            href: file.png,
                            download: file.pngName,
                          },
                          {
                            id: 'webp',
                            label: 'WEBP',
                            size: formatFileSize(file.webpBytes),
                            href: file.src,
                            download: file.webpName,
                          },
                        ]}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

type ColorArea = 'lavender' | 'deep' | 'action'
