import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Tag } from '@/components/Tag'
import { ROADMAP } from '@/constants/aboutContent'
import roadmapMedia from '@/assets/roadmap-fleet.webp'
import styles from './RoadmapCard.module.css'

const STAGES = ROADMAP.stages

/**
 * Roadmap card that walks itself from Now through Finally on a timer. The rule
 * under each marker is the clock: the active stage's bar fills across the
 * dwell, and it is that animation ending — not a JS interval — which advances
 * the card, so bar and timer can never drift apart.
 *
 * Picking a different marker jumps to that stage and starts its dwell at once.
 * Picking the open marker again pauses; a further pick restarts it. Fine-pointer
 * hover and keyboard focus still hold the timer (WCAG 2.2.2). Touch does not —
 * a tap would otherwise focus the control and freeze the bar. Under
 * `prefers-reduced-motion` the bar never animates, so the card never advances
 * on its own.
 */
export function RoadmapCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [held, setHeld] = useState(false)
  const [stopped, setStopped] = useState(false)
  /* Bumped on every pick to remount the bars, which re-arms the dwell. */
  const [runId, setRunId] = useState(0)
  const stageIdPrefix = useId()

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.35 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const holdIfFinePointer = useCallback(() => {
    /* Touch taps focus the tab; holding on that focus would freeze the clock. */
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }, [])

  const advance = useCallback(() => {
    setActiveIndex((current) => (current + 1) % STAGES.length)
  }, [])

  const select = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        if (stopped) {
          setStopped(false)
          setRunId((current) => current + 1)
        } else {
          setStopped(true)
        }
        return
      }
      setActiveIndex(index)
      setStopped(false)
      setRunId((current) => current + 1)
    },
    [activeIndex, stopped],
  )

  return (
    <section className={styles.section} aria-labelledby="roadmap-heading">
      <div ref={cardRef} className={styles.card}>
        <img className={styles.media} src={roadmapMedia} alt="" aria-hidden />
        <div className={styles.scrim} aria-hidden />

        <div className={styles.content}>
          <h2 id="roadmap-heading" className={`armada-text-title ${styles.title}`}>
            {ROADMAP.title.map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h2>

          <div
            className={styles.stages}
            style={{ ['--stage-count' as string]: STAGES.length } as CSSProperties}
            data-paused={!inView || held || stopped || undefined}
            onMouseEnter={() => {
              if (holdIfFinePointer()) setHeld(true)
            }}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => {
              if (holdIfFinePointer()) setHeld(true)
            }}
            onBlur={() => setHeld(false)}
          >
            {STAGES.map((stage, index) => {
              const bodyId = `${stageIdPrefix}-${stage.id}`
              const isActive = index === activeIndex
              return (
                <div
                  key={stage.id}
                  className={styles.stage}
                  data-active={isActive || undefined}
                  data-reached={index <= activeIndex || undefined}
                  style={{ ['--stage-col' as string]: index + 1 } as CSSProperties}
                >
                  {/* Duplicates the button's accessible name, so hide it from AT. */}
                  <span className={styles.stageLabel} aria-hidden>
                    <Tag label={stage.label} dot={isActive ? 'lavender' : undefined} />
                  </span>
                  <div id={bodyId} className={styles.stageBody} hidden={!isActive}>
                    <p className={`armada-text-detail ${styles.stageText}`}>{stage.body}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.stageButton}
                    aria-label={
                      isActive
                        ? `${stage.label}, ${stopped ? 'paused' : 'playing'}`
                        : stage.label
                    }
                    aria-expanded={isActive}
                    aria-controls={bodyId}
                    onClick={() => select(index)}
                  >
                    <span className={styles.stageRule} aria-hidden>
                      <span
                        key={runId}
                        className={styles.stageRuleFill}
                        onAnimationEnd={advance}
                      />
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
