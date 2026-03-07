"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 定义 H2 标题的数据结构
interface TocItem {
  id: string;
  text: string;
}

// 渲染单个导航链接，并在此下方挂载对应的子标题
function SidebarLink({ href, children, activeToc }: { href?: string; children: React.ReactNode; activeToc: TocItem[] }) {
  const pathname = usePathname();
  
  if (!href) return <span>{children}</span>;

  let cleanHref = href;
  if (cleanHref.startsWith("./")) {
    cleanHref = cleanHref.slice(2);
  }
  if (cleanHref === "") {
    cleanHref = "README.md";
  }
  if (!cleanHref.endsWith(".md") && !cleanHref.includes("404") && cleanHref !== "README.md") {
    if (!cleanHref.includes(".")) {
      cleanHref += ".md";
    }
  }

  const route = `/articles/${cleanHref}`;
  // 判断当前链接是否是正在阅读的文章
  const isActive = pathname === route || pathname === `${route}/`;

  return (
    <div className="relative">
      <Link 
        href={route} 
        className={`group relative text-[13px] font-mono transition-colors block py-1.5 pl-4 -ml-4 ${isActive ? 'text-tech-main' : 'text-slate-700 hover:text-tech-main'}`}
      >
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 transition-opacity text-[10px] ${isActive ? 'opacity-100 text-tech-main' : 'opacity-0 group-hover:opacity-100 text-tech-main'}`}>&gt;</span>
        <span className={`border-b pb-[1px] ${isActive ? 'border-tech-main/50' : 'border-transparent group-hover:border-tech-main/30'}`}>{children}</span>
      </Link>
      
      {/* 仅在当前文章下展开其 H2 二级标题树 */}
      {isActive && activeToc.length > 0 && (
        <ul className="pl-4 mt-1 mb-2 space-y-2 border-l border-tech-main/20 ml-1 animate-in slide-in-from-top-2 fade-in duration-300">
          {activeToc.map((h2) => (
            <li key={h2.id} className="text-[11px] text-tech-main/70 hover:text-tech-main transition-colors before:content-[''] before:w-2 before:h-[1px] before:bg-tech-main/30 before:absolute before:-ml-4 before:mt-2">
              <Link href={`#${h2.id}`} className="block break-words">
                {h2.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SidebarClient({ content }: { content: string }) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // 监听路由变化后，抓取主干 DOM 中的 h2
    // 设置一个小延时，确保 react-markdown 和 rehype-slug 已经完成了 DOM 节点的挂载
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll("main article h2");
      const tocItems: TocItem[] = [];
      headings.forEach((heading) => {
        if (heading.id && heading.textContent) {
          tocItems.push({
            id: heading.id,
            text: heading.textContent.replace(/^#\s*/, ""), // 清理哈希标志
          });
        }
      });
      setToc(tocItems);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <ReactMarkdown
      components={{
        a: ({ node, ...props }: any) => <SidebarLink href={props.href} activeToc={toc}>{props.children}</SidebarLink>,
        hr: () => <hr className="my-6 border-t border-tech-main/10" />,
        p: ({ node, ...props }: any) => <div className="font-mono text-[11px] font-bold uppercase text-tech-main/70 mt-6 mb-3 tracking-widest">{props.children}</div>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}