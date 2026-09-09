import { useId, useState } from 'react'
import { cascadeStyle, RevealStack } from '@/components/ScrollReveal'
import { USE_CASE_CARDS } from '@/constants/useCasesContent'
import styles from './UseCaseList.module.css'

/**
 * Full-width use-case rows — same interaction as About CoreTeam:
 * one open panel at a time; hover / focus / tap reveal the copy.
 */
export function UseCaseList() {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelIdPrefix = useId()

  return (
    <section className={styles.section} aria-label="Use cases">
      <RevealStack deep className={styles.layout}>
        {USE_CASE_CARDS.map((card, index) => {
          const panelId = `${panelIdPrefix}-${card.id}`
          const isActive = index === activeIndex
          return (
            <div
              key={card.id}
              className={styles.row}
              data-active={isActive || undefined}
              data-cascade=""
              style={cascadeStyle(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <h2 className={styles.rowHead}>
                <button
                  type="button"
                  className={styles.rowButton}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.rowLabel}>
                    <span className={styles.rowTitle}>{card.title}</span>
                  </span>
                </button>
              </h2>

              <div id={panelId} className={styles.panel} hidden={!isActive}>
                {card.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className={`armada-text-ui-heading-sm ${styles.body}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </RevealStack>
    </section>
  )
}
