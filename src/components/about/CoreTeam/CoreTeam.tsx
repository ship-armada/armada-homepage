import { useId, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { cascadeStyle, RevealStack } from '@/components/ScrollReveal'
import { CORE_TEAM, type TeamSocial } from '@/constants/aboutContent'
import { SocialIcon } from '@/icons/SocialIcon'
import styles from './CoreTeam.module.css'

const MEMBERS = CORE_TEAM.members

function MemberSocials({
  name,
  socials,
}: {
  name: string
  socials: TeamSocial[]
}) {
  const hasLinks = socials.some((social) => social.href)

  return (
    <ul
      className={styles.socials}
      aria-label={hasLinks ? `${name} on social media` : undefined}
      aria-hidden={hasLinks ? undefined : true}
    >
      {socials.map((social) => (
        <li key={social.icon} aria-hidden={social.href ? undefined : true}>
          {social.href ? (
            <a
              className={styles.socialLink}
              href={social.href}
              aria-label={`${name} on ${social.label}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon name={social.icon} />
            </a>
          ) : (
            <span className={styles.socialIcon}>
              <SocialIcon name={social.icon} />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Roster of full-width rows. The open member's bio sits in the right-hand
 * column of its own row, so opening one both reveals it and hides the
 * previous — exactly one is open at any time. Hover, keyboard focus and tap
 * all open a row, which keeps the pointer-driven reading available to keyboard
 * and touch users without a second interaction model. Mobile drops to one
 * column and the bio stacks under the name, giving a plain accordion.
 */
export function CoreTeam() {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelIdPrefix = useId()

  return (
    <section className={styles.section} aria-labelledby="core-team-heading">
      <RevealStack deep className={styles.layout}>
        <h2
          id="core-team-heading"
          className={`armada-text-title ${styles.heading}`}
          data-cascade=""
          style={cascadeStyle(0)}
        >
          {CORE_TEAM.title.map((line) => (
            <span key={line} className={styles.headingLine}>
              {line}
            </span>
          ))}
        </h2>

        {MEMBERS.map((member, index) => {
          const panelId = `${panelIdPrefix}-${member.id}`
          const isActive = index === activeIndex
          return (
            <div
              key={member.id}
              className={styles.member}
              data-active={isActive || undefined}
              data-cascade=""
              style={cascadeStyle(index + 1)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <h3 className={styles.memberHead}>
                <button
                  type="button"
                  className={styles.memberButton}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.memberName}>{member.name}</span>
                  <ChevronRightIcon className={styles.memberChevron} aria-hidden />
                </button>
              </h3>

              <div id={panelId} className={styles.panel} hidden={!isActive}>
                <p className={`armada-text-ui-heading-sm ${styles.bio}`}>{member.bio}</p>
                <MemberSocials name={member.name} socials={member.socials} />
              </div>
            </div>
          )
        })}
      </RevealStack>
    </section>
  )
}

