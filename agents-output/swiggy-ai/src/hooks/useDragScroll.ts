'use client'
import { useRef, useCallback } from 'react'

/**
 * Mouse drag-to-scroll for horizontal carousels.
 * Touch devices already scroll natively; this adds click-and-drag with a mouse.
 * Spread the returned props onto the scrollable row element.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const state = useRef({ down: false, startX: 0, startLeft: 0, moved: false })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    state.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    const s = state.current
    if (!s.down || !el) return
    const dx = e.clientX - s.startX
    if (Math.abs(dx) > 4) s.moved = true
    el.scrollLeft = s.startLeft - dx
  }, [])

  const end = useCallback(() => { state.current.down = false }, [])

  // Suppress the click that follows a drag so cards don't open accidentally
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }, [])

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: end,
    onPointerLeave: end,
    onClickCapture,
    style: { cursor: 'grab' } as React.CSSProperties,
  }
}
