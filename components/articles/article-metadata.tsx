"use client"

import { formatAbsoluteTime, formatRelativeTime } from "@/lib/format-time"
import authorsData from "@/lib/authors.json"
import { useState } from "react"

interface ArticleMetadataProps {
  author: string
  coAuthors?: string[]
  createdAt: string
  lastModified: string
  canonicalUrl: string
}

export function ArticleMetadata({
  author,
  coAuthors = [],
  createdAt,
  lastModified,
  canonicalUrl,
}: ArticleMetadataProps) {
  const [copied, setCopied] = useState(false)

  const getAvatarUrl = (username: string) => {
    return `https://github.com/${username}.png`
  }

  const allContributors = [author, ...coAuthors]
  const displayContributors = allContributors.slice(0, 5)
  const remainingCount = allContributors.length - 5

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="border border-tech-line bg-white/80 p-4 sm:p-6 font-mono text-sm text-tech-main">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-2">
          <img
            src={getAvatarUrl(author)}
            alt={author}
            className="w-8 h-8 border border-tech-line"
          />
          <span className="text-tech-main-dark font-bold">{author}</span>
        </div>
      </div>

      {coAuthors.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <span className="text-tech-accent">贡献者:</span>
          <div className="flex items-center gap-1">
            {displayContributors.slice(1).map((contributor) => (
              <img
                key={contributor}
                src={getAvatarUrl(contributor)}
                alt={contributor}
                className="w-6 h-6 border border-tech-line"
                title={contributor}
              />
            ))}
            {remainingCount > 0 && (
              <span className="ml-1 text-tech-accent">+{remainingCount}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-4 text-xs">
        <div>
          <span className="text-tech-accent">创建: </span>
          <span>{formatAbsoluteTime(createdAt)}</span>
        </div>
        <div>
          <span className="text-tech-accent">修改: </span>
          <span>{formatRelativeTime(lastModified)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-tech-accent">URL:</span>
        <div className="flex items-center gap-2 flex-1">
          <code className="text-xs bg-tech-bg px-2 py-1 border border-tech-line flex-1 truncate">
            {canonicalUrl}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 border border-tech-line bg-white hover:bg-tech-accent/10 transition-opacity text-xs"
            aria-label="Copy URL"
          >
            {copied ? "✓" : "复制"}
          </button>
        </div>
      </div>
    </div>
  )
}
