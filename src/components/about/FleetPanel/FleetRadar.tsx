import type { CSSProperties } from 'react'
import styles from './FleetRadar.module.css'

/**
 * Angular offset of the beam's bright leading edge inside the rotating disc.
 * Keep in sync with the `conic-gradient` stop in `FleetRadar.module.css` — it
 * is what turns a vessel's bearing into the moment the sweep reaches it.
 */
const BEAM_LEADING_EDGE_DEG = 68

/**
 * Vessels are placed in polar coordinates so their bearing — and therefore
 * the beat at which the beam reaches them — is exact. The plot origin sits on
 * the left edge at mid-height, so range is capped to keep each one inside the
 * panel: at most 96cqw across and 36cqw above or below the origin.
 */
const VESSELS = [
  { bearing: 25, range: 20, scale: 0.8 },
  { bearing: 36, range: 44, scale: 0.7 },
  { bearing: 44, range: 30, scale: 1 },
  { bearing: 54, range: 60, scale: 0.9 },
  { bearing: 58, range: 40, scale: 1.2 },
  { bearing: 67, range: 88, scale: 1.1 },
  { bearing: 70, range: 62, scale: 0.8 },
  { bearing: 80, range: 40, scale: 0.7 },
  { bearing: 84, range: 94, scale: 1 },
  { bearing: 92, range: 66, scale: 1.3 },
  { bearing: 99, range: 28, scale: 0.7 },
  { bearing: 100, range: 95, scale: 0.9 },
  { bearing: 110, range: 70, scale: 0.8 },
  { bearing: 117, range: 40, scale: 1.1 },
  { bearing: 124, range: 62, scale: 0.7 },
  { bearing: 137, range: 44, scale: 1 },
  { bearing: 152, range: 26, scale: 0.8 },
] as const

/** Grid ring radii, in percent of the panel width. */
const RINGS = [26, 52, 78, 104, 130] as const
/** Bearing spokes, clockwise from straight up. */
const SPOKES = [30, 60, 90, 120, 150] as const

const toRadians = (deg: number) => (deg * Math.PI) / 180

/**
 * Fraction of the sweep cycle at which the beam reaches this bearing. Drives
 * `animation-delay` so each vessel pings exactly as the beam crosses it.
 */
function pingOffset(bearing: number) {
  return ((((bearing - BEAM_LEADING_EDGE_DEG) % 360) + 360) % 360) / 360
}

/** Decorative sonar plot: rotating beam, vessels that light up and decay. */
export function FleetRadar() {
  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.grid}>
        {RINGS.map((radius) => (
          <span
            key={radius}
            className={styles.ring}
            style={{ ['--ring-radius' as string]: radius } as CSSProperties}
          />
        ))}
        {SPOKES.map((bearing) => (
          <span
            key={bearing}
            className={styles.spoke}
            style={{ ['--spoke-bearing' as string]: `${bearing - 90}deg` } as CSSProperties}
          />
        ))}
      </div>

      <div className={styles.sweep} />

      <div className={styles.vessels}>
        {VESSELS.map((vessel) => (
          <span
            key={`${vessel.bearing}-${vessel.range}`}
            className={styles.vessel}
            style={
              {
                ['--vessel-x' as string]: `${(vessel.range * Math.sin(toRadians(vessel.bearing))).toFixed(2)}cqw`,
                ['--vessel-y' as string]: `${(-vessel.range * Math.cos(toRadians(vessel.bearing))).toFixed(2)}cqw`,
                ['--vessel-scale' as string]: vessel.scale,
                ['--ping-offset' as string]: pingOffset(vessel.bearing).toFixed(4),
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
