import { useEffect, useId, useRef, useState } from 'react'
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ArmadaLogo } from '@/components/ArmadaLogo'
import { Button } from '@/components/Button'
import { NavMegaMenu } from '@/components/NavMegaMenu'
import { NAV_ITEMS, SOCIAL_LINKS, isNavMenu, type NavLink } from '@/constants/siteNav'
import { SocialIcon } from '@/icons/SocialIcon'
import { openAppWithWallet } from '@/utils/appNavigation'
import landingLogoWhite from '@/assets/landing-logo-white.png'
import styles from './SiteHeader.module.css'

/**
 * Mobile drawer links: flatten menus (e.g. Resources → Blog / GitHub)
 * so they stack like the footer sitemap.
 */
const MOBILE_NAV_LINKS: NavLink[] = NAV_ITEMS.flatMap((item) => {
  if (isNavMenu(item)) {
    return item.items.map((link) => ({
      id: link.id,
      label: link.title,
      href: link.href,
      ...(link.external ? { external: true as const } : {}),
    }))
  }
  return [item]
})

const SCROLL_THRESHOLD = 48
/** Hide as soon as the user turns downward. */
const SCROLL_DELTA = 6
/** Dock the solid bar after this much continuous upward travel. */
const SHOW_AFTER_UP_VIEW = 0.5
const OPEN_DELAY_MS = 80
const CLOSE_DELAY_MS = 160
/** Matches `.mobilePanel` transform duration. */
const MOBILE_DRAWER_MS = 320

export function SiteHeader() {
  /** Fixed solid chrome — only while scrolling up (or mobile menu open). */
  const [floating, setFloating] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  /** Keep drawer mounted through the close slide. */
  const [mobileMounted, setMobileMounted] = useState(false)
  const [mobileEntered, setMobileEntered] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const mobileMenuId = useId()
  const menuIdPrefix = useId()
  const burgerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const lastY = useRef(0)
  const upTravel = useRef(0)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drawerExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (drawerExitTimer.current) clearTimeout(drawerExitTimer.current)
    openTimer.current = null
    closeTimer.current = null
    drawerExitTimer.current = null
  }

  const scheduleOpen = (id: string) => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpenMenuId(id), OPEN_DELAY_MS)
  }

  const scheduleClose = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpenMenuId(null), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  useEffect(() => {
    lastY.current = window.scrollY
    upTravel.current = 0

    const onScroll = () => {
      const y = window.scrollY
      const nearTop = y <= SCROLL_THRESHOLD
      const goingDown = y > lastY.current + SCROLL_DELTA
      const goingUp = y < lastY.current

      if (openMenuId) {
        // Keep chrome available while desktop mega-menus are open
        setFloating(!nearTop)
        upTravel.current = 0
      } else if (nearTop) {
        // Absolute hero header only — never dock a second bar
        setFloating(false)
        upTravel.current = 0
      } else if (goingDown) {
        setFloating(false)
        upTravel.current = 0
      } else if (goingUp) {
        upTravel.current += lastY.current - y
        if (upTravel.current >= window.innerHeight * SHOW_AFTER_UP_VIEW) {
          setFloating(true)
        }
      }

      lastY.current = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [openMenuId])

  useEffect(() => {
    if (openMenuId && window.scrollY > SCROLL_THRESHOLD) {
      setFloating(true)
    }
  }, [openMenuId])

  useEffect(() => {
    if (!mobileOpen) {
      setMobileEntered(false)
      return
    }
    setMobileMounted(true)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setMobileEntered(true)
      return
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMobileEntered(true))
    })
    return () => cancelAnimationFrame(frame)
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen || !mobileMounted) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setMobileMounted(false)
      return
    }
    drawerExitTimer.current = setTimeout(() => {
      setMobileMounted(false)
      drawerExitTimer.current = null
    }, MOBILE_DRAWER_MS)
    return () => {
      if (drawerExitTimer.current) clearTimeout(drawerExitTimer.current)
    }
  }, [mobileOpen, mobileMounted])

  useEffect(() => {
    if (!openMenuId) return

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenuId])

  useEffect(() => {
    if (!mobileOpen) return
    const panel = panelRef.current
    const panelFocusable = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)'),
        )
      : []
    const burger = burgerRef.current
    const focusable = burger ? [burger, ...panelFocusable] : panelFocusable
    panelFocusable[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        burger?.focus()
        return
      }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileMounted ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMounted])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    if (mobileOpen) panel.removeAttribute('inert')
    else panel.setAttribute('inert', '')
  }, [mobileOpen, mobileMounted])

  const closeMobile = () => {
    setMobileOpen(false)
    burgerRef.current?.focus()
  }

  // Fixed solid bar only when floating (scroll-up). Mobile drawer sits under
  // the header and slides in without flipping the bar to solid/black chrome.
  const showSolid = floating
  const [slideIn, setSlideIn] = useState(false)

  useEffect(() => {
    if (!showSolid) {
      setSlideIn(false)
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setSlideIn(true)
      return
    }
    const frame = requestAnimationFrame(() => setSlideIn(true))
    return () => cancelAnimationFrame(frame)
  }, [showSolid])

  const headerClass = [
    styles.header,
    showSolid && styles.headerDocked,
    showSolid && styles.headerScrolled,
    showSolid && slideIn && styles.headerSlideIn,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={headerClass}>
        <div className={styles.inner}>
          <a href="/" className={styles.logoLink} aria-label="Armada home">
            {showSolid ? (
              <ArmadaLogo variant="full" className={styles.logo} />
            ) : (
              <img
                className={styles.logoImg}
                src={landingLogoWhite}
                alt=""
                width={132}
                height={32}
                aria-hidden
              />
            )}
          </a>

          <nav
            ref={navRef}
            className={styles.desktopNav}
            aria-label="Primary"
            onMouseLeave={scheduleClose}
          >
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => {
                if (!isNavMenu(item)) {
                  return (
                    <li key={item.id} className={styles.navItem}>
                      <a
                        className={styles.navLink}
                        href={item.href}
                        {...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </a>
                    </li>
                  )
                }

                const panelId = `${menuIdPrefix}-${item.id}`
                const isOpen = openMenuId === item.id
                return (
                  <li
                    key={item.id}
                    className={styles.navItem}
                    onMouseEnter={() => scheduleOpen(item.id)}
                  >
                    <button
                      type="button"
                      className={[styles.navLink, isOpen && styles.navLinkOpen]
                        .filter(Boolean)
                        .join(' ')}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenMenuId((current) => (current === item.id ? null : item.id))
                      }
                      onFocus={() => {
                        clearTimers()
                        setOpenMenuId(item.id)
                      }}
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={[styles.navChevron, isOpen && styles.navChevronOpen]
                          .filter(Boolean)
                          .join(' ')}
                        width={14}
                        height={14}
                        aria-hidden
                      />
                    </button>
                    {isOpen ? (
                      <NavMegaMenu
                        menu={item}
                        id={panelId}
                        onNavigate={() => setOpenMenuId(null)}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <ul className={styles.socialList} aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    className={styles.socialLink}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
            <Button
              variant="primary"
              size="md"
              label="Armada App"
              showIcon
              icon="arrow-right-micro"
              onClick={openAppWithWallet}
              className={styles.appCta}
            />
          </div>

          <div className={styles.mobileActions}>
            <Button
              variant="primary"
              size="md"
              label="Open app"
              showIcon={false}
              onClick={openAppWithWallet}
              className={`${styles.appCta} ${styles.mobileAppCta}`}
            />

            <button
              ref={burgerRef}
              type="button"
              className={styles.burger}
              aria-expanded={mobileOpen}
              aria-controls={mobileMenuId}
              aria-label={mobileMounted ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileMounted ? (
                <XMarkIcon width={20} height={20} aria-hidden />
              ) : (
                <Bars3Icon width={20} height={20} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileMounted ? (
        <div
          ref={panelRef}
          id={mobileMenuId}
          className={[styles.mobilePanel, mobileEntered && styles.mobilePanelEntered]
            .filter(Boolean)
            .join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav className={styles.mobileNav} aria-label="Primary mobile">
            <ul className={styles.mobileNavList}>
              {MOBILE_NAV_LINKS.map((item) => (
                <li key={item.id}>
                  <a
                    className={styles.mobileNavLink}
                    href={item.href}
                    onClick={closeMobile}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.mobileFooter}>
            <ul className={styles.mobileSocialList} aria-label="Social links">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    className={styles.mobileSocialLink}
                    href={social.href}
                    aria-label={social.label}
                    onClick={closeMobile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon name={social.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
