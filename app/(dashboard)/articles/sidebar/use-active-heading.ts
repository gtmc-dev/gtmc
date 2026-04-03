"use client"

import { useState, useEffect, useRef } from "react"
import type { TocItem } from "./use-toc"

export function useActiveHeading(
  toc: TocItem[],
  pathname: string
): string | null {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname
      setActiveHeadingId(null)
    }
  }, [pathname])

  useEffect(() => {
    if (!toc || toc.length === 0) {
      setActiveHeadingId(null)
      return
    }

    const headingIds = toc.map((item) => item.id)
    const headingElements = headingIds
      .map((id) => {
        // Escape special characters in CSS selector
        const escapedId = CSS.escape(id)
        return document.querySelector(`main h2#${escapedId}`)
      })
      .filter((el) => el !== null) as Element[]

    if (headingElements.length === 0) {
      setActiveHeadingId(null)
      return
    }

    const intersectingHeadings = new Set<string>()
    let lastActiveId: string | null = headingIds[0] || null

    setActiveHeadingId(lastActiveId)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id
          if (entry.isIntersecting) {
            intersectingHeadings.add(id)
          } else {
            intersectingHeadings.delete(id)
          }
        })

        if (intersectingHeadings.size > 0) {
          const activeId =
            headingIds.find((id) => intersectingHeadings.has(id)) || null
          if (activeId) {
            lastActiveId = activeId
            setActiveHeadingId(activeId)
          }
        } else if (lastActiveId) {
          setActiveHeadingId(lastActiveId)
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    )

    headingElements.forEach((el) => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [toc])

  return activeHeadingId
}
