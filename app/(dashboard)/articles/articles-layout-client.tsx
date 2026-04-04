"use client"

import * as React from "react"
import { SidebarClient } from "./sidebar-client"
import { SidebarProvider } from "./sidebar/sidebar-context"
import {
  ScanConfirmOverlay,
  SectionRail,
  SegmentedBar,
} from "../features/loading-shell-primitives"
import type { TreeNode } from "@/types/sidebar-tree"

interface ArticlesLayoutProps {
  children: React.ReactNode
  tree: TreeNode[]
}

function TreeLoadingPlaceholder() {
  return (
    <div
      className="
        relative h-full animate-tree-drop-in overflow-hidden border guide-line
        bg-white/80 px-3 py-4
        motion-reduce:animate-none
        md:min-h-160 md:px-4 md:py-5
      "
      style={{
        animation: "tree-drop-in 1.05s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
      aria-hidden="true">
      <ScanConfirmOverlay className="opacity-40" />
      <SectionRail
        label="TREE_BOOTSTRAP"
        className="mb-3 text-[10px] opacity-75"
      />

      <div className="space-y-6 pr-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-1 bg-tech-main/45" />
            <SegmentedBar opacity="high" className="h-4 w-4/5" />
          </div>

          <div className="nested-list">
            <div className="flex items-center gap-2">
              <span className="h-px w-2 bg-tech-main/40" />
              <SegmentedBar opacity="medium" className="h-3.5 w-3/4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px w-2 bg-tech-main/40" />
              <SegmentedBar opacity="medium" className="h-3.5 w-2/3" />
            </div>

            <div className="ml-2 nested-list">
              <div className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-tech-main/35" />
                <SegmentedBar opacity="low" className="h-3 w-3/5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-tech-main/35" />
                <SegmentedBar opacity="low" className="h-3 w-2/5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-1 bg-tech-main/45" />
            <SegmentedBar opacity="high" className="h-4 w-2/3" />
          </div>

          <div className="nested-list">
            <div className="flex items-center gap-2">
              <span className="h-px w-2 bg-tech-main/40" />
              <SegmentedBar opacity="medium" className="h-3.5 w-3/5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px w-2 bg-tech-main/40" />
              <SegmentedBar opacity="low" className="h-3.5 w-1/3" />
            </div>
          </div>
        </div>

        <div className="nested-list">
          <div className="flex items-center gap-2">
            <span className="h-px w-2 bg-tech-main/35" />
            <SegmentedBar opacity="medium" className="h-3.5 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-px w-2 bg-tech-main/35" />
            <SegmentedBar opacity="low" className="h-3.5 w-2/5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-px w-2 bg-tech-main/35" />
            <SegmentedBar opacity="low" className="h-3.5 w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArticlesLayoutClient({ children, tree }: ArticlesLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  return (
    <SidebarProvider tree={tree}>
      <div className="
        mx-auto flex w-full max-w-7xl items-start justify-center gap-6 px-4
        sm:px-6
        lg:px-8
      ">
        <aside
          className={`
            sticky top-[80px] hidden h-[calc(100vh-100px)] shrink-0
            transition-all duration-300 ease-in-out
            md:block
            ${isSidebarOpen ? "w-[280px] opacity-100" : `
              w-0 overflow-hidden opacity-0
            `}
          `}>
          <div className="flex h-full w-[280px] flex-col">
            <SidebarClient tree={tree} internalScroll scrollClass="h-full" />
          </div>
        </aside>

        <main
          className={`
            relative my-6 w-full flex-1 transition-all duration-300 ease-in-out
            ${isSidebarOpen ? `
              max-w-3xl
              lg:max-w-4xl
            ` : `
              max-w-4xl
              lg:max-w-5xl
              xl:max-w-6xl
            `}
          `}>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="
                group flex items-center gap-2 border border-tech-main/40
                bg-tech-main/5 px-3 py-1.5 font-mono text-[10px] text-tech-main
                transition-colors
                hover:bg-tech-main hover:text-white
              "
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}>
              <span className="inline-block w-4 text-center">
                {isSidebarOpen ? "◀" : "▶"}
              </span>
              SYS.TOGGLE_SIDEBAR
            </button>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
