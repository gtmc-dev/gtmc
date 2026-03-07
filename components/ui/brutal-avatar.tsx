import React from "react";
import Image from "next/image";

interface BrutalAvatarProps {
  src?: string | null;
  alt?: string | null;
  size?: string;
  fallback?: string;
  className?: string;
}

export function BrutalAvatar({ src, alt, size, fallback, className = "" }: BrutalAvatarProps) {
  return (
    <div className={`relative flex items-center justify-center bg-slate-100 border border-tech-main/30 overflow-hidden w-full h-full aspect-square ${className}`}>
      {/* 十字瞄准准星 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-tech-main/10 -translate-x-1/2"></div>
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-tech-main/10 -translate-y-1/2"></div>
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-tech-main/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-tech-main/50"></div>
      </div>
      
      {src ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <span className="font-mono text-xl font-bold text-tech-main/30 uppercase z-0">
          {(fallback || alt || "?")[0]}
        </span>
      )}
    </div>
  );
}

