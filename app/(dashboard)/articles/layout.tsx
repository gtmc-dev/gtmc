import * as React from "react"
import { ArticlesLayoutClient } from "./articles-layout-client"
import { getSidebarTree } from "@/actions/sidebar"

export default async function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tree = await getSidebarTree()
  return <ArticlesLayoutClient tree={tree}>{children}</ArticlesLayoutClient>
}
