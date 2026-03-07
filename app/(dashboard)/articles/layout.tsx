import * as React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { SidebarClient } from "./sidebar-client";

export default async function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarPath = path.join(process.cwd(), "assets", "_sidebar.md");
  let sidebarContent = "";
  try {
    sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
  } catch (error) {
    sidebarContent = "Sidebar not found.";
  }

  return (
    <div className="max-w-full mx-auto flex flex-col md:flex-row relative min-h-[calc(100vh-8rem)]">
      {/* 侧边栏：Docsify风格，移除所有卡片感，纯净边框 */}
      <aside className="w-full md:w-64 lg:w-[300px] shrink-0 md:border-r border-tech-main/20">
        <div className="md:sticky md:top-20 hover:z-20 md:h-[calc(100vh-5rem)] flex flex-col">
          <div className="py-4 md:py-6 pr-0 md:pr-6 overflow-y-auto flex-1 text-tech-main custom-scrollbar max-h-[50vh] md:max-h-none border-b md:border-b-0 border-tech-main/20 mb-6 md:mb-0 relative group">
            <div className="absolute left-0 top-0 w-[1px] h-0 bg-tech-main group-hover:h-full transition-all duration-1000 ease-out opacity-20 hidden md:block"></div>
            
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-tech-main/20">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-tech-main/60 font-bold flex items-center">
                <span className="w-1.5 h-1.5 bg-tech-main/60 inline-block mr-2 animate-pulse"></span>
                SYS.DIR_TREE
              </div>
              <div className="text-[8px] font-mono text-tech-main/40 hidden xl:block">READ-ONLY</div>
            </div>

            <div className="prose prose-sm prose-tech font-mono w-full overflow-hidden break-words [&>ul]:pl-0 [&_ul]:list-none [&_li]:mt-1.5 [&_ul_ul]:pl-3 [&_ul_ul]:border-l [&_ul_ul]:border-tech-main/20 [&_ul_ul]:mt-1.5 [&_ul_ul]:mb-3">
              <SidebarClient content={sidebarContent} />
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 md:pl-10 lg:pl-16 py-6 border-l border-transparent overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
