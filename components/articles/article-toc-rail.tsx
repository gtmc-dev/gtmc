"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { useSidebarContext } from "@/app/[locale]/(dashboard)/articles/sidebar/sidebar-context"

function useScrollProgress() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.body.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return progress
}

export function ArticleTocRail() {
  const { toc, activeHeadingId } = useSidebarContext()
  const progress = useScrollProgress()

  if (toc.length === 0) return null

  return (
    <nav
      aria-label="Table of contents"
      className="
        group hidden xl:flex
        sticky top-20 ml-4 self-start
        h-[calc(100vh-5rem)] shrink-0
        w-1.5 hover:w-52
        transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        overflow-hidden
        border-l border-tech-main/20
        bg-tech-bg/80
      "
    >
      <div className="absolute left-0 top-0 h-0.5 w-full bg-tech-main/15">
        <div
          className="h-full bg-tech-main transition-[width] duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        className="
          flex w-52 flex-col gap-0 pt-4 pb-6 px-3
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none group-hover:pointer-events-auto
        "
      >
        <div className="mb-3 font-mono text-[0.625rem] font-bold tracking-[0.12em] text-tech-main/50 uppercase">
          CONTENTS
        </div>

        <ul className="flex flex-col gap-0">
          {toc.map((item) => {
            const isActive = item.id === activeHeadingId
            return (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className={`
                    block border-l-[3px] py-1.5 pl-3 pr-1 text-sm leading-snug
                    transition-all duration-200
                    break-words
                    ${
                      isActive
                        ? "border-tech-main font-semibold text-tech-main"
                        : "border-transparent text-tech-main/50 hover:border-tech-main/30 hover:text-tech-main"
                    }
                  `}
                >
                  {item.text}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
