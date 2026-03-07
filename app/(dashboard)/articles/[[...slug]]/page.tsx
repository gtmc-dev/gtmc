import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { notFound } from "next/navigation";
import { BrutalCard } from "@/components/ui/brutal-card";
import Link from "next/link";

interface ArticlePageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let filePathArray = slug || ["README.md"];

  let rawPath = filePathArray.map(decodeURIComponent).join("/");

  let fullPath = path.join(process.cwd(), "assets", rawPath);

  if (!fs.existsSync(fullPath)) {
    if (fs.existsSync(fullPath + ".md")) {
      fullPath += ".md";
    } else {
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const readmePath = path.join(fullPath, "README.md");
          if (fs.existsSync(readmePath)) {
            fullPath = readmePath;
            rawPath = path.join(rawPath, "README.md");
          }
        }
      } catch (e) {
      }
    }
  }

  let content = "";
  try {
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
       if (stat.isDirectory()) {
         const readmePath = path.join(fullPath, "README.md");
         if (fs.existsSync(readmePath)) {
            content = fs.readFileSync(readmePath, "utf-8");
         } else {
            notFound();
         }
       } else {
         notFound();
       }
    } else {
       content = fs.readFileSync(fullPath, "utf-8");
    }
  } catch (error) {
    if (rawPath.includes("404")) {
      content = "# 404 Not Found\n\nThe requested article is not available yet.";
    } else {
      notFound();
    }
  }

  const relativeLinkPrefix = "/articles";
  let editPath = path.relative(path.join(process.cwd(), "assets"), fullPath).replace(/\\/g, "/");

  return (
    <div className="p-4 md:p-8 pb-32 min-h-screen bg-transparent relative border border-tech-main/30 backdrop-blur-sm shadow-[0_0_15px_rgba(255,107,0,0.05)]">
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tech-main/50"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tech-main/50"></div>
      <div className="absolute top-4 right-4 md:top-8 md:right-8 group">
        <Link href={`/draft/new?file=${encodeURIComponent(editPath)}`}>
          <button className="flex items-center gap-2 border border-tech-main/50 bg-tech-main/10 hover:bg-tech-main text-tech-main hover:text-black px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10 font-bold">[EDIT_TARGET]</span>
          </button>
        </Link>
      </div>

      <div className="mb-12 border-b border-tech-main/20 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-tech-main/50 flex items-center mb-1">
            <span className="w-2 h-2 bg-tech-main/50 mr-2 animate-pulse"></span>
            SYS.READ_STREAM | UTF-8
          </div>
          <div className="text-[10px] font-mono text-slate-500">PATH: {rawPath}</div>
        </div>
      </div>

      <div className="prose prose-tech max-w-none w-full overflow-hidden break-words text-slate-800 selection:bg-tech-main/20 selection:text-slate-900">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlug]}
          components={{
            table: ({ node, ...props }) => (
              <div className="w-full overflow-x-auto my-6 border border-tech-main/30 bg-white/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse font-mono text-sm min-w-[600px]" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-tech-main/10 border-b border-tech-main/30" {...props} />,
            th: ({ node, ...props }) => <th className="p-3 font-semibold text-tech-main border-r border-tech-main/10 last:border-r-0 whitespace-nowrap" {...props} />,
            td: ({ node, ...props }) => <td className="p-3 border-r border-t border-tech-main/10 last:border-r-0 text-slate-700" {...props} />,
            
            h1: ({ node, ...props }: any) => (
              <h1 id={props.id} className="group relative text-3xl lg:text-4xl font-mono uppercase mt-8 mb-6 tracking-[0.1em] border-b border-tech-main/30 pb-4 text-slate-900 scroll-m-20">
                {props.id && (
                  <a href={`#${props.id}`} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-tech-main transition-opacity text-xl font-normal no-underline">#</a>
                )}
                {props.children}
              </h1>
            ),
            h2: ({ node, ...props }: any) => (
              <h2 id={props.id} className="group relative text-2xl font-mono uppercase mt-12 mb-6 tracking-[0.1em] text-slate-800 border-b border-tech-main/30 inline-block pr-8 scroll-m-20">
                {props.id && (
                  <a href={`#${props.id}`} className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-tech-main transition-opacity text-lg font-normal no-underline">#</a>
                )}
                {props.children}
              </h2>
            ),
            h3: ({ node, ...props }: any) => (
              <h3 id={props.id} className="group relative text-xl font-mono uppercase mt-8 mb-4 tracking-widest text-slate-700 scroll-m-20">
                {props.id && (
                  <a href={`#${props.id}`} className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-tech-main transition-opacity text-base font-normal no-underline">#</a>
                )}
                {props.children}
              </h3>
            ),

            p: ({ node, ...props }) => <p className="text-base leading-relaxed mb-6 font-mono text-slate-800" {...props} />,
            a: ({ node, ...props }) => {
              let href = props.href || "";
              if (href.startsWith("./") || href.startsWith("../")) {
                 const currentDir = path.dirname("/" + rawPath).replace(/^\/+/, "");
                 try {
                    const resolved = path.join(currentDir, href).replace(/\\/g, "/");
                    href = `/articles/${resolved}`;
                 } catch(e) {}
              } else if (!href.startsWith("http") && !href.startsWith("#") && !href.startsWith("/")) {
                 const currentDir = path.dirname("/" + rawPath).replace(/^\/+/, "");
                 const resolved = path.join(currentDir, href).replace(/\\/g, "/");
                 href = `/articles/${resolved}`;
              }
              return <Link href={href} className="text-tech-main border-b border-tech-main/50 font-mono hover:text-white hover:bg-tech-main/80 transition-colors" {...props} />
            },
            ul: ({ node, ...props }) => <ul className="list-none pl-6 mb-6 space-y-2 font-mono border-l border-tech-main/30 text-slate-800" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2 font-mono text-slate-800" {...props} />,
            li: ({ node, ...props }) => <li className="relative before:content-['>'] before:absolute before:-left-6 before:text-tech-main/50 text-slate-800" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-2 border-tech-main bg-tech-main/5 p-4 mb-6 italic font-mono text-slate-700" {...props} />
            ),
            img: ({ node, ...props }) => {
               let src = (props.src as string) || "";
               if (src.startsWith("./") || src.startsWith("../") || (!src.startsWith("http") && !src.startsWith("/"))) {
                  const currentDir = path.dirname("/" + rawPath).replace(/^\/+/, "");
                  const resolved = path.join(currentDir, src).replace(/\\/g, "/");
                  src = `/api/assets?path=${encodeURIComponent(resolved)}`;
               }
               return <img src={src} alt={props.alt || ""} className="max-w-full h-auto border border-tech-main/30 p-1 bg-tech-main/5 my-8 shadow-sm" />
            },
            code: ({ node, className, children, ref, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <div className="my-6 border border-tech-main/30 font-mono text-sm max-w-full overflow-hidden bg-[#1e1e1e] shadow-sm">
                  <div className="bg-tech-main/10 text-tech-main px-4 py-1 text-xs font-mono uppercase tracking-widest flex justify-between items-center border-b border-tech-main/30">
                    <span>{match[1]}</span>
                    <span className="opacity-50">{'//'} EXECUTABLE_BLOCK</span>
                  </div>
                  <div className="overflow-x-auto">
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ) : (
                <code className="bg-tech-main/10 px-1 py-0.5 font-mono text-[13px] text-tech-main border border-tech-main/30 rounded-none" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}