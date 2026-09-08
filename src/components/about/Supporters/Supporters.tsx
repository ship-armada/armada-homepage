import { cascadeStyle, RevealStack } from '@/components/ScrollReveal'
import { SUPPORTERS } from '@/constants/aboutContent'
import styles from './Supporters.module.css'

/** Two-column editorial block: heading left, prose right. */
export function Supporters() {
  return (
    <section className={styles.section} aria-labelledby="supporters-heading">
      <RevealStack deep className={styles.layout}>
        <h2
          id="supporters-heading"
          className={`armada-text-title ${styles.heading}`}
          data-cascade=""
          style={cascadeStyle(0)}
        >
          {SUPPORTERS.title.map((line) => (
            <span key={line} className={styles.headingLine}>
              {line}
            </span>
          ))}
        </h2>
        <div className={styles.prose}>
          {SUPPORTERS.body.map((paragraph, index) => (
            <p
              key={'lead' in paragraph ? `${paragraph.lead}${paragraph.body}` : paragraph.body}
              className={`armada-text-body ${styles.paragraph}`}
              data-cascade=""
              style={cascadeStyle(index + 1)}
            >
              {'lead' in paragraph ? (
                <>
                  <strong className={styles.lead}>{paragraph.lead}</strong>
                  {paragraph.body}
                </>
              ) : (
                paragraph.body
              )}
            </p>
          ))}
        </div>
      </RevealStack>
    </section>
  )
}
