import { NextResponse } from "next/server"
import { getPublicSidebarTree } from "@/lib/articles/public-tree"

const TREE_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"

export async function GET() {
  try {
    const tree = await getPublicSidebarTree()
    return NextResponse.json(tree, {
      headers: {
        "Cache-Control": TREE_CACHE_CONTROL,
      },
    })
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": TREE_CACHE_CONTROL,
      },
    })
  }
}
