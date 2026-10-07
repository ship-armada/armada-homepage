import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import styles from './FleetDownloadMenu.module.css'

export type FleetDownloadOption = {
  id: string
  label: string
  size: string
  href: string
  download: string
}

type FleetDownloadMenuProps = {
  label: string
  options: FleetDownloadOption[]
}

function readSpacing(name: string, fallback: number) {
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name),
  )
  return Number.isFinite(value) ? value : fallback
}

export function FleetDownloadMenu({ label, options }: FleetDownloadMenuProps) {
  const menuId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [placed, setPlaced] = useState(false)

  function close(restoreFocus: boolean) {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }

  useLayoutEffect(() => {
    if (!open) {
      setPlaced(false)
      return
    }

    const place = () => {
      const button = buttonRef.current
      const menu = menuRef.current
      if (!button || !menu) return
      const rect = button.getBoundingClientRect()
      const menuRect = menu.getBoundingClientRect()
      const gap = readSpacing('--primitives-spacing-2', 8)
      const edge = readSpacing('--primitives-spacing-3', 12)
      let left = rect.right - menuRect.width
      left = Math.max(edge, Math.min(left, window.innerWidth - menuRect.width - edge))
      let top = rect.bottom + gap
      if (top + menuRect.height > window.innerHeight - edge) {
        top = rect.top - gap - menuRect.height
      }
      top = Math.max(edge, top)
      menu.style.top = `${top}px`
      menu.style.left = `${left}px`
      setPlaced(true)
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, options])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (buttonRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      close(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || !placed) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [open, placed])

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ]
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (items.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      items[index < 0 ? 0 : (index + 1) % items.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      items[index <= 0 ? items.length - 1 : index - 1]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      items[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1]?.focus()
    } else if (event.key === 'Tab') {
      close(false)
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <ArrowDownTrayIcon aria-hidden width={20} height={20} />
      </button>
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            className={styles.menu}
            role="menu"
            aria-label={label}
            data-placed={placed ? 'true' : 'false'}
            onKeyDown={onMenuKeyDown}
          >
            {options.map((option) => (
              <li key={option.id} role="none">
                <a
                  className={styles.item}
                  role="menuitem"
                  href={option.href}
                  download={option.download}
                  onClick={() => close(false)}
                >
                  <span className={`armada-text-ui-label-md ${styles.itemLabel}`}>{option.label}</span>
                  <span className={`armada-text-detail ${styles.itemSize}`}>{option.size}</span>
                </a>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}
