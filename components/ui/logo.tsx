import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-sm px-3 py-1",
    md: "text-xl px-5 py-1.5",
    lg: "text-3xl px-8 py-2.5",
    xl: "text-5xl md:text-6xl px-12 py-4",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl md:text-5xl",
  };
  
  const slashClasses = {
    sm: "text-[10px]",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-2xl",
  };

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center justify-center bg-[#3c4a63] text-white font-black italic transform -skew-x-12 hover:bg-[#2c384e] transition-colors ${sizeClasses[size]} ${className}`}
    >
      <span className={`transform skew-x-12 flex items-center tracking-widest ${textClasses[size]}`}>
        <span className={`opacity-50 font-normal mr-2 ${slashClasses[size]}`}>{"//"}</span>
        GTMC
      </span>
    </Link>
  );
}
