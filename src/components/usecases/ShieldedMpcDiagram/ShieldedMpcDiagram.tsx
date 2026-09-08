import { useEffect, useRef, useState } from 'react'
import {
  CheckCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
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

/** Keep in sync with useThreeScene camera framing. */
const SPHERE_RADIUS = 2.4
const CAMERA_Z = 8.0
const CAMERA_FOV_DEG = 45

/**
 * Wide stage — viewport is a camera that frames ONE segment at a time.
 * FRAME is the design-unit shot; scale fills the purple pane with that shot.
 */
const FRAME = 300
const DESIGN_W = 2000
const DESIGN_H = 300

const TRAVEL_MS = 8200
const END_HOLD_MS = 2200
const HOLD_BEFORE_MS = 900

type Phase = 'wallet' | 'pool' | 'dest'

type Layout = {
  width: number
  height: number
  /** Rightmost painted edge — may exceed width if a grid item overflows. */
  contentRight: number
  inLines: string[]
  outLine: string
  travelPath: string
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

/** Pan so the focused block’s center sits in the middle of the purple pane. */
function panForFocus(
  viewportW: number,
  contentRight: number,
  focus: { x: number; left: number; right: number },
  margin: number,
): number {
  /* Primary: center the focus point. */
  let pan = viewportW / 2 - focus.x

  const focusW = focus.right - focus.left
  const usable = viewportW - 2 * margin
  if (focusW <= usable) {
    /* Keep both edges inside the pane (constraints were previously inverted). */
    pan = Math.max(pan, margin - focus.left)
    pan = Math.min(pan, viewportW - margin - focus.right)
  }

  /* Allow the camera to travel past the stage ends so left/right shots can center. */
  const minPan = viewportW - margin - Math.max(contentRight, focus.right)
  const maxPan = margin - Math.min(0, focus.left)
  return Math.min(maxPan, Math.max(minPan, pan))
}

function measureLayout(
  stageEl: HTMLElement,
  canvasEl: HTMLElement,
  walletEl: HTMLElement,
  pillEls: HTMLElement[],
  destEl: HTMLElement,
): Layout | null {
  const stage = stageEl.getBoundingClientRect()
  if (stage.width < 1 || stage.height < 1) return null

  const canvas = canvasEl.getBoundingClientRect()
  const wallet = walletEl.getBoundingClientRect()
  const dest = destEl.getBoundingClientRect()

  const sphereCxScreen = canvas.left + canvas.width / 2
  const sphereCyScreen = canvas.top + canvas.height / 2
  const sphereR = Math.max(28, silhouettePixelRadius(canvas.height) - 0.5)
  const sphereLeft = localPoint(stage, sphereCxScreen - sphereR, sphereCyScreen)
  const sphereRight = localPoint(stage, sphereCxScreen + sphereR, sphereCyScreen)
  const sphereCx = sphereLeft.x + sphereR
  const sphereCy = sphereLeft.y

  const inLines = pillEls.map((pill) => {
    const rect = pill.getBoundingClientRect()
    const attach = localPoint(stage, rect.right, rect.top + rect.height / 2)
    return pathPillToSphere(attach, sphereLeft)
  })

  const destAttach = localPoint(stage, dest.left, dest.top + dest.height / 2)
  const destCenter = localPoint(stage, dest.left + dest.width / 2, dest.top + dest.height / 2)
  const destLeft = localPoint(stage, dest.left, 0).x
  const destRight = localPoint(stage, dest.right, 0).x

  const firstPill = pillEls[0]?.getBoundingClientRect()
  const travelStart = firstPill
    ? localPoint(stage, firstPill.right, firstPill.top + firstPill.height / 2)
    : sphereLeft

  const outLine = `M ${sphereRight.x} ${sphereRight.y} C ${sphereRight.x + 48} ${sphereRight.y}, ${destAttach.x - 48} ${destAttach.y}, ${destAttach.x} ${destAttach.y}`
  const throughY = sphereCy + Math.min(20, sphereR * 0.18)
  const travelPath = [
    `M ${travelStart.x} ${travelStart.y}`,
    `L ${sphereLeft.x} ${sphereCy}`,
    `L ${sphereCx} ${throughY}`,
    `L ${sphereRight.x} ${sphereCy}`,
    `L ${destCenter.x} ${destCenter.y}`,
  ].join(' ')

  const walletLeft = localPoint(stage, wallet.left, 0).x
  const walletRight = localPoint(stage, wallet.right, 0).x
  const walletCenter = (walletLeft + walletRight) / 2
  const contentRight = Math.max(stage.width, walletRight, sphereRight.x, destRight) + 8

  return {
    width: stage.width,
    height: stage.height,
    contentRight,
    inLines,
    outLine,
    travelPath,
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

/**
 * Scaled continuous MPC flow with a L→R camera pan.
 * Real PrivacySphere + per-pill connectors + USDC traveler under the pills.
 */
export function ShieldedMpcDiagram() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const walletRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLLIElement | null)[]>([])
  const destRef = useRef<HTMLDivElement>(null)
  const travelPathRef = useRef<SVGPathElement>(null)
  const sharpRef = useRef<HTMLImageElement>(null)
  const blurRef = useRef<HTMLImageElement>(null)
  const sharpLayerRef = useRef<HTMLDivElement>(null)
  const blurLayerRef = useRef<HTMLDivElement>(null)

  const [layout, setLayout] = useState<Layout | null>(null)
  const [phase, setPhase] = useState<Phase>('wallet')
  const [panX, setPanX] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

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
      /* Mobile: aspect-ratio pane can resolve a frame late — retry until sized. */
      if (vw <= 0 || vh <= 0) {
        raf = window.requestAnimationFrame(fit)
        return
      }
      /*
        Zoom so ONE segment fills the purple pane.
        Match the shorter axis so the shot is centered with no empty band.
      */
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
    const destEl = destRef.current
    if (!stageEl || !canvasEl || !walletEl || !destEl) return

    const update = () => {
      const pills = pillRefs.current.filter(Boolean) as HTMLElement[]
      if (pills.length < 3) return
      const next = measureLayout(stageEl, canvasEl, walletEl, pills, destEl)
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
    if (typeof document !== 'undefined' && 'fonts' in document) {
      void document.fonts.ready.then(update)
    }
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !layout) return

    const applyPan = () => {
      /* Keep framed content clear of the diagram’s rounded corners. */
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

    const pathEl = travelPathRef.current
    const sharpEl = sharpRef.current
    const blurEl = blurRef.current
    if (!pathEl || !sharpEl || !blurEl) return

    let frameId = 0
    let timeoutId = 0
    let running = true
    const pathLen = pathEl.getTotalLength()

    const hide = () => {
      sharpEl.style.opacity = '0'
      blurEl.style.opacity = '0'
    }

    const place = (distance: number) => {
      const point = pathEl.getPointAtLength(Math.min(pathLen, Math.max(0, distance)))
      const transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`
      sharpEl.style.transform = transform
      blurEl.style.transform = `${transform} scale(1.2)`
    }

    const tickTrip = (startTime: number) => {
      const now = performance.now()
      const t = Math.min(1, (now - startTime) / TRAVEL_MS)
      place(t * pathLen)
      sharpEl.style.opacity = '1'
      blurEl.style.opacity = '1'

      if (t < 0.2) setPhase('wallet')
      else if (t < 0.7) setPhase('pool')
      else setPhase('dest')

      if (t < 1) {
        frameId = window.requestAnimationFrame(() => tickTrip(startTime))
        return
      }

      setPhase('dest')
      timeoutId = window.setTimeout(() => {
        if (!running) return
        hide()
        setPhase('wallet')
        timeoutId = window.setTimeout(startTrip, 500)
      }, END_HOLD_MS)
    }

    const startTrip = () => {
      if (!running) return
      setPhase('wallet')
      place(0)
      sharpEl.style.opacity = '1'
      blurEl.style.opacity = '1'
      frameId = window.requestAnimationFrame(() => tickTrip(performance.now()))
    }

    hide()
    timeoutId = window.setTimeout(startTrip, HOLD_BEFORE_MS)

    return () => {
      running = false
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [layout, reducedMotion])

  return (
    <div ref={viewportRef} className={styles.viewport} aria-hidden>
      <div
        ref={stageRef}
        className={styles.stage}
        data-phase={phase}
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
            {layout.inLines.map((d, index) => (
              <path
                key={index}
                d={d}
                className={`${styles.stroke} ${phase === 'wallet' || phase === 'pool' ? styles.strokeLit : ''}`}
              />
            ))}
            <path
              d={layout.outLine}
              className={`${styles.stroke} ${phase === 'dest' ? styles.strokeLit : ''}`}
            />
            <path ref={travelPathRef} d={layout.travelPath} className={styles.travelPath} />
          </svg>
        ) : null}

        <div ref={blurLayerRef} className={styles.travelerLayerBlur} aria-hidden>
          <img
            ref={blurRef}
            className={`${styles.traveler} ${styles.travelerBlur}`}
            src={usdcLogoUrl}
            alt=""
            draggable={false}
          />
        </div>
        <div ref={sharpLayerRef} className={styles.travelerLayerSharp} aria-hidden>
          <img
            ref={sharpRef}
            className={styles.traveler}
            src={usdcLogoUrl}
            alt=""
            draggable={false}
          />
        </div>

        <div
          ref={walletRef}
          className={`${styles.node} ${styles.wallet} ${phase === 'wallet' ? styles.nodeOn : ''}`}
        >
          <p className={styles.nodeEyebrow}>Institutional wallet</p>
          <ul className={styles.walletStack}>
            {WALLET_ROWS.map(({ label, Icon }, index) => (
              <li
                key={label}
                ref={(el) => {
                  pillRefs.current[index] = el
                }}
                className={styles.walletPill}
              >
                <Icon className={styles.walletIcon} aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.sphereSlot}>
          <div ref={canvasHostRef} className={styles.canvasHost} />
          <ul
            className={`${styles.privacyPills} ${phase === 'pool' ? styles.privacyOn : ''}`}
          >
            {PRIVACY_PILLS.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <div
          ref={destRef}
          className={`${styles.node} ${styles.dest} ${phase === 'dest' ? styles.nodeOn : ''}`}
        >
          <div className={styles.destPill}>
            <span className={styles.tokenCluster} aria-hidden>
              <img src={usdcLogoUrl} alt="" className={styles.usdc} />
              <span className={styles.plusBadge} />
            </span>
            <span>Recipients, venues, counterparties</span>
          </div>
        </div>
      </div>
    </div>
  )
}
