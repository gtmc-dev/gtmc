import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSidebarTree } from "@/actions/sidebar"

interface SearchResult {
  title: string
  slug: string
  snippet: string | null
  matchType: "title" | "content"
}

interface TreeNode {
  id: string
  title: string
  slug: string
  isFolder: boolean
  parentId: string | null
  children: TreeNode[]
}

function flattenTree(nodes: TreeNode[]): { title: string; slug: string }[] {
  const result: { title: string; slug: string }[] = []
  for (const node of nodes) {
    if (!node.isFolder) {
      result.push({ title: node.title, slug: node.slug })
    }
    if (node.children?.length) {
      result.push(...flattenTree(node.children))
    }
  }
  return result
}

/** Strip markdown syntax for cleaner snippets */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/__(.+?)__/g, "$1") // bold alt
    .replace(/_(.+?)_/g, "$1") // italic alt
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline/block code
    .replace(/^\s*[-*+]\s+/gm, "") // list markers
    .replace(/^\s*>\s+/gm, "") // blockquotes
    .replace(/\n{2,}/g, " ") // collapse newlines
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
}

function extractSnippet(content: string, query: string): string | null {
  const clean = stripMarkdown(content)
  const lower = clean.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return null

  const start = Math.max(0, idx - 50)
  const end = Math.min(clean.length, idx + query.length + 70)
  let snippet = clean.slice(start, end).trim()
  if (start > 0) snippet = "\u2026" + snippet
  if (end < clean.length) snippet += "\u2026"
  return snippet
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results: SearchResult[] = []
  const seenSlugs = new Set<string>()

  try {
    const titleMatches = await prisma.article.findMany({
      where: {
        isFolder: false,
        title: { contains: q, mode: "insensitive" },
      },
      select: { title: true, slug: true, content: true },
      take: 20,
    })

    for (const article of titleMatches) {
      seenSlugs.add(article.slug)
      results.push({
        title: article.title,
        slug: article.slug,
        snippet: null,
        matchType: "title",
      })
    }

    const contentMatches = await prisma.article.findMany({
      where: {
        isFolder: false,
        content: { contains: q, mode: "insensitive" },
        NOT: { title: { contains: q, mode: "insensitive" } },
      },
      select: { title: true, slug: true, content: true },
      take: 20,
    })

    for (const article of contentMatches) {
      seenSlugs.add(article.slug)
      results.push({
        title: article.title,
        slug: article.slug,
        snippet: extractSnippet(article.content, q),
        matchType: "content",
      })
    }
  } catch (error) {
    console.error("DB search failed:", error)
  }

  // 2. Search tree titles (covers GitHub-only articles)
  try {
    const tree = await getSidebarTree()
    const allArticles = flattenTree(tree)

    for (const article of allArticles) {
      if (seenSlugs.has(article.slug)) continue
      if (article.title.toLowerCase().includes(q.toLowerCase())) {
        seenSlugs.add(article.slug)
        results.push({
          title: article.title,
          slug: article.slug,
          snippet: null,
          matchType: "title",
        })
      }
    }
  } catch (error) {
    console.error("Tree search failed:", error)
  }

  // Sort: title matches first, then content matches
  results.sort((a, b) => {
    if (a.matchType === "title" && b.matchType !== "title") return -1
    if (a.matchType !== "title" && b.matchType === "title") return 1
    return 0
  })

  return NextResponse.json(
    { results: results.slice(0, 20) },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
