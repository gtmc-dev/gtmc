"use client"

import { useState } from "react"
import { resolvePerson } from "@/lib/markdown/people"
import { UesrAvatar } from "@/components/ui/user-avatar"
import { CornerBrackets } from "@/components/ui/corner-brackets"
import type { ResolvedPerson } from "@/lib/markdown/people"
import type { MarkdownComponentProps } from "@/lib/markdown/component-types"

export function PeopleMention({ children, ...props }: MarkdownComponentProps) {
  const personKey = (props["data-person-key"] as string) ?? ""
  const person: ResolvedPerson = resolvePerson(personKey)
  const [isOpen, setIsOpen] = useState(false)
  const popupId = `people-popup-${personKey}`

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={`View profile: ${person.name}`}
        aria-expanded={isOpen}
        aria-describedby={popupId}
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-0.5 border border-tech-main/30
          bg-tech-main/5 px-1 font-mono text-[0.8em] tracking-wide
          text-tech-main no-underline transition-colors
          hover:bg-tech-main/80 hover:text-white
          focus-visible:ring-2 focus-visible:ring-tech-main/50
          focus-visible:outline-none
        ">
        {children}
      </button>

      <div
        id={popupId}
        role="tooltip"
        className={`
          absolute left-0 z-50 mt-2 w-72 border border-tech-main/40
          bg-white/90 p-4 backdrop-blur-md sm:w-80
          ${isOpen ? "" : "pointer-events-none hidden"}
        `}>
        <CornerBrackets
          variant="static"
          color="border-tech-main/30"
          size="size-3"
        />

        <p className="mb-3 font-mono text-xs tracking-wide text-tech-main/60">
          SYS.PEOPLE_LOOKUP
        </p>

        <div className="flex items-center gap-3">
          <div className="size-12">
            <UesrAvatar
              src={person.profile}
              alt={person.name}
              fallback={person.isFallback ? "?" : person.name[0]}
            />
          </div>
          <span className="font-mono text-sm font-medium tracking-wide">
            {person.name}
          </span>
        </div>

        {!person.isFallback && (
          <>
            {person.description && (
              <p className="mt-3 text-xs/relaxed text-tech-main/60">
                {person.description}
              </p>
            )}
            {person.email && (
              <p className="mt-2 font-mono text-xs text-tech-main/60">
                {person.email}
              </p>
            )}
            {Object.keys(person.social).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {person.social.github && (
                  <a
                    href={`https://github.com/${person.social.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tech-main underline-offset-2 hover:underline">
                    github
                  </a>
                )}
                {person.social.twitter && (
                  <a
                    href={`https://twitter.com/${person.social.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tech-main underline-offset-2 hover:underline">
                    twitter
                  </a>
                )}
                {person.social.bilibili && (
                  <a
                    href={`https://space.bilibili.com/${person.social.bilibili}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tech-main underline-offset-2 hover:underline">
                    bilibili
                  </a>
                )}
                {person.social.website && (
                  <a
                    href={person.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tech-main underline-offset-2 hover:underline">
                    website
                  </a>
                )}
                {person.social.custom?.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-tech-main underline-offset-2 hover:underline">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </span>
  )
}
