import type { UseCaseCardContent } from '@/constants/useCasesContent'
import styles from './UseCaseCardNumbered.module.css'

type UseCaseCardNumberedProps = UseCaseCardContent & {
  /** 1-based index — rendered as 01, 02, … */
  index: number
}

/**
 * Numbered use-case card — index chip + title at the top, body anchored at the bottom.
 */
export function UseCaseCardNumbered({
  title,
  body,
  index,
}: UseCaseCardNumberedProps) {
  const label = String(index).padStart(2, '0')

  return (
    <article className={styles.root} aria-labelledby={`use-case-${label}-title`}>
      <div className={styles.top}>
        <div className={styles.indexChip} aria-hidden>
          <span className={`armada-text-title ${styles.index}`}>{label}</span>
        </div>
        <h3 id={`use-case-${label}-title`} className={styles.headline}>
          {title}
        </h3>
      </div>
      <div className={styles.textBlock}>
        {body.map((paragraph) => (
          <p key={paragraph} className={`armada-text-ui-body-sm ${styles.body}`}>
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  )
}
