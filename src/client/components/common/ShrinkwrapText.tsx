import type { HTMLAttributes } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

type ShrinkwrapTextProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & { children: string }

/**
 * Block span that sizes its width to the longest wrapped line of its text content.
 *
 * CSS has no way to shrink the width of a wrapping text span below max-content width, so this
 * measures line rects via the Range API and applies the result as an explicit width.
 */
const ShrinkwrapText = ({ children, style, ...props }: ShrinkwrapTextProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | undefined>()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      // Release any previously applied width before measuring: otherwise new text (e.g. after a
      // language change) wraps against the old constraint instead of the container's natural width.
      const prevWidth = el.style.width
      el.style.width = 'auto'
      const range = document.createRange()
      range.selectNodeContents(el)
      const max = Math.max(0, ...Array.from(range.getClientRects(), r => r.width))
      el.style.width = prevWidth
      setWidth(max || undefined)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el.parentElement ?? el)
    return () => ro.disconnect()
  }, [children])

  return (
    <span ref={ref} style={{ display: 'block', width, ...style }} {...props}>
      {children}
    </span>
  )
}

export default ShrinkwrapText
