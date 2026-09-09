import { useEffect, useRef, useState } from 'react'
import {
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  CheckCircleIcon,
  KeyIcon,
  PauseIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import usdcLogoUrl from '@/assets/usdc-logo.svg'
import { useThreeScene } from '@/components/PrivacySphere/useThreeScene'
import styles from './ShieldedMpcDiagram.module.css'

const WALLET_ROWS = [
  { label: 'Approvals', Icon: CheckCircleIcon },
  { label: 'Policies', Icon: ShieldCheckIcon },
  { label: 'MPC signing', Icon: KeyIcon },
] as const

const PRIVACY_PILLS = [
  'Private balances',
  'Private counterparties',
  'Obscured relationships',
] as const

const DEST_ROWS = [
  { label: 'Recipients', Icon: UserGroupIcon },
  { label: 'Venues', Icon: BuildingStorefrontIcon },
  { label: 'Counterparties', Icon: BuildingOffice2Icon },
] as const

const DISCLOSURE_PILLS = [
  { label: 'Authorized reviewers', Icon: UserIcon },
  { label: 'Accountant', Icon: CalculatorIcon },
  { label: 'Auditor', Icon: ShieldCheckIcon },
] as const

/** Keep in sync with useThreeScene camera framing. */
const SPHERE_RADIUS = 2.4
const CAMERA_Z = 8.0
const CAMERA_FOV_DEG = 45

/**
 * Wide stage — viewport is a camera that frames ONE segment at a time.
 * FRAME is the design-unit shot; scale fills the purple pane with that shot.
 */
const FRAME = 480
const DESIGN_W = 2200
const DESIGN_H = 480

type Phase = 'wallet' | 'pool' | 'dest'

/** Inbound leg (wallet frame → sphere). */
const CONVERGE_MS = 2600
/** Single coin through the pool to the sphere’s right edge. */
const THROUGH_MS = 1800
/** Fan out 1 → 3 into destination cards. */
const DIVERGE_MS = 2200
const TRIP_MS = CONVERGE_MS + THROUGH_MS + DIVERGE_MS
/** Overlapping waves so the stream never goes idle. */
const WAVE_COUNT = 3
const DEST_COUNT = DEST_ROWS.length
const DIVERGE_SLOT_COUNT = WAVE_COUNT * DEST_COUNT
const STAGGER_MS = Math.round(TRIP_MS / WAVE_COUNT)
const HOLD_BEFORE_MS = 400

/** Camera dwell — pool stays longer so privacy chips can enter after their delay. */
const PHASE_HOLD_MS = {
  wallet: 4200,
  pool: 6500,
  dest: 5200,
} as const satisfies Record<Phase, number>

const PHASE_CYCLE_MS =
  PHASE_HOLD_MS.wallet + PHASE_HOLD_MS.pool + PHASE_HOLD_MS.dest

function phaseAtElapsed(elapsed: number): Phase {
  const t = ((elapsed % PHASE_CYCLE_MS) + PHASE_CYCLE_MS) % PHASE_CYCLE_MS
  if (t < PHASE_HOLD_MS.wallet) return 'wallet'
  if (t < PHASE_HOLD_MS.wallet + PHASE_HOLD_MS.pool) return 'pool'
  return 'dest'
}

/**
 * Snap the clock to the middle of the current beat so pause never lands on a
 * camera pan boundary (wallet ↔ pool ↔ dest).
 */
function snapElapsedToStableBeat(elapsed: number): { phase: Phase; elapsed: number } {
  const cycleIndex = Math.floor(elapsed / PHASE_CYCLE_MS)
  const t = ((elapsed % PHASE_CYCLE_MS) + PHASE_CYCLE_MS) % PHASE_CYCLE_MS
  let phase: Phase = 'wallet'
  let start = 0
  let hold: number = PHASE_HOLD_MS.wallet

  if (t < PHASE_HOLD_MS.wallet) {
    phase = 'wallet'
    start = 0
    hold = PHASE_HOLD_MS.wallet
  } else if (t < PHASE_HOLD_MS.wallet + PHASE_HOLD_MS.pool) {
    phase = 'pool'
    start = PHASE_HOLD_MS.wallet
    hold = PHASE_HOLD_MS.pool
  } else {
    phase = 'dest'
    start = PHASE_HOLD_MS.wallet + PHASE_HOLD_MS.pool
    hold = PHASE_HOLD_MS.dest
  }

  return {
    phase,
    elapsed: cycleIndex * PHASE_CYCLE_MS + start + hold * 0.45,
  }
}

type Layout = {
  width: number
  height: number
  contentRight: number
  /** Single stroke from wallet frame → sphere. */
  inLine: string
  /** Strokes from sphere → each destination card. */
  outLines: string[]
  /** Travel path wallet → sphere edge. */
  convergePath: string
  /** Travel path through the pool to the sphere’s right edge. */
  throughPath: string
  /** Travel paths sphere right → each destination card. */
  divergePaths: string[]
  sphereCx: number
  sphereCy: number
  sphereR: number
  focus: Record<Phase, { x: number; left: number; right: number }>
}

function silhouettePixelRadius(canvasHeight: number): number {
  const fovRad = (CAMERA_FOV_DEG * Math.PI) / 180
  const silZ = (SPHERE_RADIUS * SPHERE_RADIUS) / CAMERA_Z
  const silR =
    SPHERE_RADIUS * Math.sqrt(1 - (SPHERE_RADIUS * SPHERE_RADIUS) / (CAMERA_Z * CAMERA_Z))
  const distToPlane = CAMERA_Z - silZ
  const visibleHeight = 2 * Math.tan(fovRad / 2) * distToPlane
  return (silR / visibleHeight) * canvasHeight
}

function localPoint(root: DOMRect, x: number, y: number) {
  return { x: x - root.left, y: y - root.top }
}

function pathPillToSphere(
  attach: { x: number; y: number },
  sphereLeft: { x: number; y: number },
): string {
  const midX = attach.x + (sphereLeft.x - attach.x) * 0.55
  return `M ${attach.x} ${attach.y} C ${midX} ${attach.y}, ${midX} ${sphereLeft.y}, ${sphereLeft.x} ${sphereLeft.y}`
}

function pathSphereToPill(
  sphereRight: { x: number; y: number },
  attach: { x: number; y: number },
): string {
  const midX = sphereRight.x + (attach.x - sphereRight.x) * 0.45
  return `M ${sphereRight.x} ${sphereRight.y} C ${midX} ${sphereRight.y}, ${midX} ${attach.y}, ${attach.x} ${attach.y}`
}

/** Pan so the focused block’s center sits in the middle of the purple pane. */
function panForFocus(
  viewportW: number,
  contentRight: number,
  focus: { x: number; left: number; right: number },
  margin: number,
): number {
  let pan = viewportW / 2 - focus.x

  const focusW = focus.right - focus.left
  const usable = viewportW - 2 * margin
  if (focusW <= usable) {
    pan = Math.max(pan, margin - focus.left)
    pan = Math.min(pan, viewportW - margin - focus.right)
  }

  const minPan = viewportW - margin - Math.max(contentRight, focus.right)
  const maxPan = margin - Math.min(0, focus.left)
  return Math.min(maxPan, Math.max(minPan, pan))
}

function measureLayout(
  stageEl: HTMLElement,
  canvasEl: HTMLElement,
  walletEl: HTMLElement,
  frameEl: HTMLElement,
  destEl: HTMLElement,
  destCardEls: HTMLElement[],
): Layout | null {
  const stage = stageEl.getBoundingClientRect()
  if (stage.width < 1 || stage.height < 1) return null
  if (destCardEls.length < DEST_COUNT) return null

  const canvas = canvasEl.getBoundingClientRect()
  const wallet = walletEl.getBoundingClientRect()
  const frame = frameEl.getBoundingClientRect()
  const dest = destEl.getBoundingClientRect()

  const sphereCxScreen = canvas.left + canvas.width / 2
  const sphereCyScreen = canvas.top + canvas.height / 2
  const sphereR = Math.max(28, silhouettePixelRadius(canvas.height) - 0.5)
  const sphereLeft = localPoint(stage, sphereCxScreen - sphereR, sphereCyScreen)
  const sphereRight = localPoint(stage, sphereCxScreen + sphereR, sphereCyScreen)
  const sphereCx = sphereLeft.x + sphereR
  const sphereCy = sphereLeft.y

  const attach = localPoint(stage, frame.right, frame.top + frame.height / 2)
  const convergePath = pathPillToSphere(attach, sphereLeft)

  const divergePaths = destCardEls.map((card) => {
    const rect = card.getBoundingClientRect()
    const cardAttach = localPoint(stage, rect.left, rect.top + rect.height / 2)
    return pathSphereToPill(sphereRight, cardAttach)
  })

  const destLeft = localPoint(stage, dest.left, 0).x
  const destRight = localPoint(stage, dest.right, 0).x
  const destCenter = localPoint(stage, dest.left + dest.width / 2, dest.top + dest.height / 2)

  const throughY = sphereCy + Math.min(20, sphereR * 0.18)
  const throughPath = [
    `M ${sphereLeft.x} ${sphereCy}`,
    `L ${sphereCx} ${throughY}`,
    `L ${sphereRight.x} ${sphereCy}`,
  ].join(' ')

  const walletLeft = localPoint(stage, wallet.left, 0).x
  const walletRight = localPoint(stage, wallet.right, 0).x
  const walletCenter = (walletLeft + walletRight) / 2
  const contentRight = Math.max(stage.width, walletRight, sphereRight.x, destRight) + 8

  return {
    width: stage.width,
    height: stage.height,
    contentRight,
    inLine: convergePath,
    outLines: divergePaths,
    convergePath,
    throughPath,
    divergePaths,
    sphereCx,
    sphereCy,
    sphereR,
    focus: {
      wallet: { x: walletCenter, left: walletLeft, right: walletRight },
      pool: {
        x: sphereCx,
        left: sphereLeft.x,
        right: sphereRight.x,
      },
      dest: { x: destCenter.x, left: destLeft, right: destRight },
    },
  }
}

function sphereMasks(cx: number, cy: number, r: number) {
  const inside = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, #000 ${r - 0.5}px, transparent ${r}px)`
  const outside = `radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent ${r - 0.5}px, #000 ${r}px)`
  return { inside, outside }
}

type TravelerPair = {
  sharp: HTMLImageElement | null
  blur: HTMLImageElement | null
}

function placeTraveler(pair: TravelerPair, x: number, y: number, opacity: number) {
  const { sharp, blur } = pair
  if (!sharp || !blur) return
  const transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
  sharp.style.transform = transform
  sharp.style.opacity = String(opacity)
  blur.style.transform = `${transform} scale(1.2)`
  blur.style.opacity = String(opacity)
}

function hideTraveler(pair: TravelerPair) {
  placeTraveler(pair, 0, 0, 0)
}

/**
 * Scaled continuous MPC flow with a L→R camera pan.
 * USDC leaves as one, passes through the pool, then splits into three destinations.
 */
export function ShieldedMpcDiagram() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const walletRef = useRef<HTMLDivElement>(null)
  const walletFrameRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)
  const destCardRefs = useRef<(HTMLLIElement | null)[]>([])
  const convergePathRef = useRef<SVGPathElement>(null)
  const throughPathRef = useRef<SVGPathElement>(null)
  const divergePathRefs = useRef<(SVGPathElement | null)[]>([])
  const sharpLayerRef = useRef<HTMLDivElement>(null)
  const blurLayerRef = useRef<HTMLDivElement>(null)
  const inboundSharpRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: WAVE_COUNT }, () => null),
  )
  const inboundBlurRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: WAVE_COUNT }, () => null),
  )
  const throughSharpRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: WAVE_COUNT }, () => null),
  )
  const throughBlurRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: WAVE_COUNT }, () => null),
  )
  const divergeSharpRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: DIVERGE_SLOT_COUNT }, () => null),
  )
  const divergeBlurRefs = useRef<(HTMLImageElement | null)[]>(
    Array.from({ length: DIVERGE_SLOT_COUNT }, () => null),
  )

  const [layout, setLayout] = useState<Layout | null>(null)
  const [phase, setPhase] = useState<Phase>('wallet')
  const [panX, setPanX] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const streamStartRef = useRef(0)

  useThreeScene(canvasHostRef)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const stage = stageRef.current
    if (!viewport || !stage) return

    let raf = 0

    const fit = () => {
      const { clientWidth: vw, clientHeight: vh } = viewport
      if (vw <= 0 || vh <= 0) {
        raf = window.requestAnimationFrame(fit)
        return
      }
      const scale = (Math.min(vw, vh) * 0.96) / FRAME
      stage.style.setProperty('--s', String(scale))
      stage.style.width = `${DESIGN_W * scale}px`
      stage.style.height = `${DESIGN_H * scale}px`
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(viewport)
    return () => {
      ro.disconnect()
      window.cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const stageEl = stageRef.current
    const canvasEl = canvasHostRef.current
    const walletEl = walletRef.current
    const frameEl = walletFrameRef.current
    const destEl = destRef.current
    if (!stageEl || !canvasEl || !walletEl || !frameEl || !destEl) return

    const update = () => {
      const cards = destCardRefs.current.filter(Boolean) as HTMLElement[]
      const next = measureLayout(stageEl, canvasEl, walletEl, frameEl, destEl, cards)
      if (!next) return
      setLayout(next)
      const { inside, outside } = sphereMasks(next.sphereCx, next.sphereCy, next.sphereR)
      const blurLayer = blurLayerRef.current
      const sharpLayer = sharpLayerRef.current
      if (blurLayer) {
        blurLayer.style.webkitMaskImage = inside
        blurLayer.style.maskImage = inside
      }
      if (sharpLayer) {
        sharpLayer.style.webkitMaskImage = outside
        sharpLayer.style.maskImage = outside
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(stageEl)
    ro.observe(canvasEl)
    ro.observe(frameEl)
    ro.observe(destEl)
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready.then(update)
    }
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !layout) return

    const applyPan = () => {
      const margin = 24
      const focus = reducedMotion ? layout.focus.pool : layout.focus[phase]
      setPanX(panForFocus(viewport.clientWidth, layout.contentRight, focus, margin))
    }

    applyPan()
    const ro = new ResizeObserver(applyPan)
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [layout, phase, reducedMotion])

  useEffect(() => {
    if (!layout || reducedMotion) {
      if (reducedMotion) setPhase('pool')
      return
    }

    const convergePath = convergePathRef.current
    const throughPath = throughPathRef.current
    const divergePaths = divergePathRefs.current.filter(Boolean) as SVGPathElement[]
    if (!convergePath || !throughPath || divergePaths.length < DEST_COUNT) return

    const throughLen = throughPath.getTotalLength()
    const convergeLen = convergePath.getTotalLength()
    const divergeLens = divergePaths.map((path) => path.getTotalLength())

    let frameId = 0
    let timeoutId = 0
    let running = true
    let lastPhase: Phase = 'wallet'

    const hideSlot = (sharp: HTMLImageElement | null, blur: HTMLImageElement | null) => {
      placeTraveler({ sharp, blur }, 0, 0, 0)
    }

    const hideAll = () => {
      for (let i = 0; i < WAVE_COUNT; i += 1) {
        hideSlot(inboundSharpRefs.current[i] ?? null, inboundBlurRefs.current[i] ?? null)
        hideSlot(throughSharpRefs.current[i] ?? null, throughBlurRefs.current[i] ?? null)
      }
      for (let i = 0; i < DIVERGE_SLOT_COUNT; i += 1) {
        hideSlot(divergeSharpRefs.current[i] ?? null, divergeBlurRefs.current[i] ?? null)
      }
    }

    const renderWave = (wave: number, age: number) => {
      const divergeBase = wave * DEST_COUNT
      if (age < 0 || age >= TRIP_MS) {
        hideSlot(inboundSharpRefs.current[wave] ?? null, inboundBlurRefs.current[wave] ?? null)
        hideSlot(throughSharpRefs.current[wave] ?? null, throughBlurRefs.current[wave] ?? null)
        for (let d = 0; d < DEST_COUNT; d += 1) {
          hideSlot(
            divergeSharpRefs.current[divergeBase + d] ?? null,
            divergeBlurRefs.current[divergeBase + d] ?? null,
          )
        }
        return
      }

      if (age < CONVERGE_MS) {
        hideSlot(throughSharpRefs.current[wave] ?? null, throughBlurRefs.current[wave] ?? null)
        for (let d = 0; d < DEST_COUNT; d += 1) {
          hideSlot(
            divergeSharpRefs.current[divergeBase + d] ?? null,
            divergeBlurRefs.current[divergeBase + d] ?? null,
          )
        }
        const t = age / CONVERGE_MS
        const point = convergePath.getPointAtLength(t * convergeLen)
        placeTraveler(
          {
            sharp: inboundSharpRefs.current[wave] ?? null,
            blur: inboundBlurRefs.current[wave] ?? null,
          },
          point.x,
          point.y,
          1,
        )
        return
      }

      if (age < CONVERGE_MS + THROUGH_MS) {
        hideSlot(inboundSharpRefs.current[wave] ?? null, inboundBlurRefs.current[wave] ?? null)
        for (let d = 0; d < DEST_COUNT; d += 1) {
          hideSlot(
            divergeSharpRefs.current[divergeBase + d] ?? null,
            divergeBlurRefs.current[divergeBase + d] ?? null,
          )
        }
        const throughT = (age - CONVERGE_MS) / THROUGH_MS
        const point = throughPath.getPointAtLength(throughT * throughLen)
        placeTraveler(
          {
            sharp: throughSharpRefs.current[wave] ?? null,
            blur: throughBlurRefs.current[wave] ?? null,
          },
          point.x,
          point.y,
          1,
        )
        return
      }

      hideSlot(inboundSharpRefs.current[wave] ?? null, inboundBlurRefs.current[wave] ?? null)
      hideSlot(throughSharpRefs.current[wave] ?? null, throughBlurRefs.current[wave] ?? null)
      const divergeT = Math.min(1, (age - CONVERGE_MS - THROUGH_MS) / DIVERGE_MS)
      divergePaths.forEach((pathEl, index) => {
        const point = pathEl.getPointAtLength(divergeT * (divergeLens[index] ?? 0))
        placeTraveler(
          {
            sharp: divergeSharpRefs.current[divergeBase + index] ?? null,
            blur: divergeBlurRefs.current[divergeBase + index] ?? null,
          },
          point.x,
          point.y,
          1,
        )
      })
    }

    const tick = (now: number) => {
      if (!running) return

      const elapsed = now - streamStartRef.current
      if (!pausedRef.current) {
        const nextPhase = phaseAtElapsed(elapsed)
        if (nextPhase !== lastPhase) {
          lastPhase = nextPhase
          setPhase(nextPhase)
        }
      }

      for (let wave = 0; wave < WAVE_COUNT; wave += 1) {
        const age = (elapsed - wave * STAGGER_MS) % TRIP_MS
        const waveAge = elapsed < wave * STAGGER_MS ? -1 : age
        renderWave(wave, waveAge)
      }

      frameId = window.requestAnimationFrame(tick)
    }

    hideAll()
    timeoutId = window.setTimeout(() => {
      if (!running) return
      streamStartRef.current = performance.now()
      frameId = window.requestAnimationFrame(tick)
    }, HOLD_BEFORE_MS)

    return () => {
      running = false
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [layout, reducedMotion])

  const pausePan = () => {
    if (reducedMotion || pausedRef.current) return
    const now = performance.now()
    const liveElapsed =
      streamStartRef.current > 0 ? Math.max(0, now - streamStartRef.current) : 0
    const { phase: stablePhase } = snapElapsedToStableBeat(liveElapsed)
    pausedRef.current = true
    setPaused(true)
    setPhase(stablePhase)
  }

  const resumePan = () => {
    if (reducedMotion || !pausedRef.current) return
    pausedRef.current = false
    setPaused(false)
  }

  return (
    <div
      className={styles.root}
      data-paused={paused || undefined}
      onPointerEnter={pausePan}
      onPointerLeave={resumePan}
      aria-hidden
    >
      <PauseIcon className={styles.pauseIcon} aria-hidden />
      <div ref={viewportRef} className={styles.viewport}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-phase={phase}
          data-paused={paused || undefined}
          data-reduced={reducedMotion || undefined}
          style={{ transform: `translate3d(${panX}px, 0, 0)` }}
        >
        {layout ? (
          <svg
            className={styles.connectors}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            <path
              d={layout.inLine}
              className={`${styles.stroke} ${phase === 'wallet' || phase === 'pool' ? styles.strokeLit : ''}`}
            />
            {layout.outLines.map((d, index) => (
              <path
                key={`out-${index}`}
                d={d}
                className={`${styles.stroke} ${phase === 'dest' ? styles.strokeLit : ''}`}
              />
            ))}
            <path ref={convergePathRef} d={layout.convergePath} className={styles.travelPath} />
            <path ref={throughPathRef} d={layout.throughPath} className={styles.travelPath} />
            {layout.divergePaths.map((d, index) => (
              <path
                key={`diverge-${index}`}
                ref={(el) => {
                  divergePathRefs.current[index] = el
                }}
                d={d}
                className={styles.travelPath}
              />
            ))}
          </svg>
        ) : null}

        <div ref={blurLayerRef} className={styles.travelerLayerBlur} aria-hidden>
          {Array.from({ length: WAVE_COUNT }, (_, index) => (
            <img
              key={`blur-in-${index}`}
              ref={(el) => {
                inboundBlurRefs.current[index] = el
              }}
              className={`${styles.traveler} ${styles.travelerBlur}`}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
          {Array.from({ length: WAVE_COUNT }, (_, index) => (
            <img
              key={`blur-th-${index}`}
              ref={(el) => {
                throughBlurRefs.current[index] = el
              }}
              className={`${styles.traveler} ${styles.travelerBlur}`}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
          {Array.from({ length: DIVERGE_SLOT_COUNT }, (_, index) => (
            <img
              key={`blur-dv-${index}`}
              ref={(el) => {
                divergeBlurRefs.current[index] = el
              }}
              className={`${styles.traveler} ${styles.travelerBlur}`}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
        </div>
        <div ref={sharpLayerRef} className={styles.travelerLayerSharp} aria-hidden>
          {Array.from({ length: WAVE_COUNT }, (_, index) => (
            <img
              key={`sharp-in-${index}`}
              ref={(el) => {
                inboundSharpRefs.current[index] = el
              }}
              className={styles.traveler}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
          {Array.from({ length: WAVE_COUNT }, (_, index) => (
            <img
              key={`sharp-th-${index}`}
              ref={(el) => {
                throughSharpRefs.current[index] = el
              }}
              className={styles.traveler}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
          {Array.from({ length: DIVERGE_SLOT_COUNT }, (_, index) => (
            <img
              key={`sharp-dv-${index}`}
              ref={(el) => {
                divergeSharpRefs.current[index] = el
              }}
              className={styles.traveler}
              src={usdcLogoUrl}
              alt=""
              draggable={false}
            />
          ))}
        </div>

        <div
          ref={walletRef}
          className={`${styles.node} ${styles.wallet} ${phase === 'wallet' ? styles.nodeOn : ''}`}
        >
          <p className={styles.nodeEyebrow}>Institutional wallet</p>
          <div ref={walletFrameRef} className={styles.walletFrame}>
            <ul className={styles.walletStack}>
              {WALLET_ROWS.map(({ label, Icon }) => (
                <li key={label} className={styles.walletCard}>
                  <span className={styles.walletIconTile} aria-hidden>
                    <Icon className={styles.walletIcon} />
                  </span>
                  <span className={styles.walletTitle}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`${styles.node} ${styles.sphere} ${phase === 'pool' ? styles.nodeOn : ''}`}
        >
          <div className={styles.sphereSlot}>
            <div ref={canvasHostRef} className={styles.canvasHost} />
            <div
              className={`${styles.privacy} ${phase === 'pool' ? styles.privacyOn : ''}`}
            >
              <p className={`${styles.nodeEyebrow} ${styles.privacyTitle}`}>Armada</p>
              <ul className={styles.privacyCards}>
                {PRIVACY_PILLS.map((label, index) => (
                  <li
                    key={label}
                    style={{ ['--privacy-cascade' as string]: String(index) }}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          ref={destRef}
          className={`${styles.node} ${styles.dest} ${phase === 'dest' ? styles.nodeOn : ''}`}
        >
          <div className={styles.destSlot}>
            <div className={styles.destBody}>
              <p className={styles.nodeEyebrow}>Payments · Trading · Treasury</p>
              <ul className={styles.destStack}>
                {DEST_ROWS.map(({ label, Icon }, index) => (
                  <li
                    key={label}
                    ref={(el) => {
                      destCardRefs.current[index] = el
                    }}
                    className={styles.destPill}
                  >
                    <span className={styles.destIconTile} aria-hidden>
                      <Icon className={styles.destIcon} />
                    </span>
                    <span className={styles.destTitle}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`${styles.disclosure} ${phase === 'dest' ? styles.disclosureOn : ''}`}
            >
              <p className={`${styles.nodeEyebrow} ${styles.disclosureTitle}`}>
                Selective disclosure
              </p>
              <ul className={styles.disclosurePills}>
                {DISCLOSURE_PILLS.map(({ label, Icon }, index) => (
                  <li
                    key={label}
                    style={{ ['--disclosure-cascade' as string]: String(index) }}
                  >
                    <span className={styles.disclosureIcon} aria-hidden>
                      <Icon />
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
