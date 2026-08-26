import { ArmadaLogo } from '@/components/ArmadaLogo'
import { cascadeStyle, useScrollReveal } from '@/components/ScrollReveal'
import { getFooterNavLinks, SOCIAL_LINKS } from '@/constants/siteNav'
import { SocialIcon } from '@/icons/SocialIcon'
import wordmarkWhite from '@/assets/armada-wordmark-white.svg'
import styles from './SiteFooter.module.css'

/**
 * Footer sitemap: direct nav links + Resources children (Blog, GitHub).
 * GitHub also appears with Discord / X as a social icon.
 */
const FOOTER_LINKS = getFooterNavLinks()

export function SiteFooter() {
  const reveal = useScrollReveal<HTMLElement>({ deep: true })
  const socialStart = 1 + FOOTER_LINKS.length

  return (
    <footer ref={reveal.ref} className={`${styles.footer} ${reveal.className}`}>
      <div className={styles.topRow}>
        <a
          href="/"
          className={styles.logoLink}
          aria-label="Armada home"
          data-cascade=""
          style={cascadeStyle(0)}
        >
          <ArmadaLogo variant="mark" markTone="white" className={styles.logo} />
        </a>

        <nav className={styles.nav} aria-label="Site map">
          <ul className={styles.sitemap}>
            {FOOTER_LINKS.map((item, index) => (
              <li
                key={item.id}
                className={styles.column}
                data-cascade=""
                style={cascadeStyle(1 + index)}
              >
                <h2 className={`${styles.columnTitle} ${styles.columnTitleSolo}`} id={`footer-${item.id}`}>
                  <a
                    className={styles.columnTitleLink}
                    href={item.href}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {item.label}
                  </a>
                </h2>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={styles.socialList} aria-label="Social links">
          {SOCIAL_LINKS.map((social, index) => (
            <li key={social.label} data-cascade="" style={cascadeStyle(socialStart + index)}>
              <a className={styles.socialLink} href={social.href} aria-label={social.label}>
                <SocialIcon name={social.icon} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={styles.wordmarkWrap}
        data-cascade=""
        style={cascadeStyle(socialStart + SOCIAL_LINKS.length)}
      >
        <img
          className={styles.wordmark}
          src={wordmarkWhite}
          alt=""
          width={1200}
          height={210}
          aria-hidden
        />
      </div>
    </footer>
  )
}
