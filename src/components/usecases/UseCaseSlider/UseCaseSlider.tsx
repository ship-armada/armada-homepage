import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { IconButton } from '@/components/IconButton'
import { Tag } from '@/components/Tag'
import { USE_CASE_CARDS } from '@/constants/useCasesContent'
import { UseCaseCardNumbered } from '@/components/usecases/UseCaseCardNumbered'
import styles from './UseCaseSlider.module.css'

/** Horizontal snap slider of numbered use-case cards. */
export function UseCaseSlider() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanPrev(track.scrollLeft > 4)
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    sync()
    track.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      track.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const scrollByCards = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const first = track.querySelector<HTMLElement>('[data-slide]')
    if (!first) return
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
    track.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: 'smooth' })
  }

  return (
    <section className={styles.section} aria-labelledby="use-case-slider-heading">
      <div className={styles.toolbar}>
        <h2 id="use-case-slider-heading" className={styles.heading}>
          <Tag label="Use cases" dot="lavender" />
        </h2>
        <div className={styles.controls}>
          <IconButton
            variant="frosted"
            size="md"
            aria-label="Previous use case"
            disabled={!canPrev}
            onClick={() => scrollByCards(-1)}
            icon={<ChevronLeftIcon strokeWidth={1.5} />}
          />
          <IconButton
            variant="frosted"
            size="md"
            aria-label="Next use case"
            disabled={!canNext}
            onClick={() => scrollByCards(1)}
            icon={<ChevronRightIcon strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className={styles.viewport}>
        <ul
          ref={trackRef}
          className={styles.track}
          role="list"
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Use case cards"
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              scrollByCards(-1)
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              scrollByCards(1)
            }
          }}
        >
          {USE_CASE_CARDS.map((card, index) => (
            <li key={card.id} className={styles.slide} data-slide="">
              <UseCaseCardNumbered {...card} index={index + 1} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
