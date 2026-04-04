"use client"

import * as React from "react"
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

export function ArticlesLayoutClient({ children }: ArticlesLayoutProps) {
  <main
    className="
      relative my-6 w-full flex-1
      md:max-w-2xl
      xl:max-w-3xl
      [1920px]:w-5xl
    ">
    {children}
  </main>
}
