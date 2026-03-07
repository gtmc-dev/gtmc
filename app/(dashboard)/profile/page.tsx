import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalAvatar } from "@/components/ui/brutal-avatar";
import { updateProfileAction } from "@/actions/profile";
import { SignOutButton } from "@/components/ui/sign-out-button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 mt-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-tech-main pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-tech-main-dark flex items-center">
            <span className="w-10 h-10 flex items-center justify-center bg-tech-main text-white mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            </span>
            USER_PROFILE
          </h1>
          <p className="text-sm font-mono tracking-[0.2em] mt-2 text-tech-main/60 uppercase">
            CONFIG // IDENTITY // TOKENS // SETTINGS
          </p>
        </div>
        <div className="font-mono text-sm text-tech-main/60 mt-4 md:mt-0 tracking-widest px-4 py-1 border border-tech-main/30 bg-tech-main/5 flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></span>
          SYS.STATE: <span className="text-green-600 font-bold ml-2">ACTIVE</span>
        </div>
      </div>

      <div className="border-[3px] border-tech-main bg-white relative w-full shadow-[8px_8px_0px_0px_rgba(96,112,143,1)]">
        <div className="absolute top-0 right-0 bg-tech-main text-white text-[10px] font-mono tracking-widest px-3 py-1">
          CONFIG.PANEL_V2
        </div>
        
        <form action={updateProfileAction} className="p-8 md:p-12 space-y-10 relative z-10">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
              <BrutalAvatar src={user.image} alt={user.name} size="lg" className="w-full h-full shadow-[4px_4px_0px_0px_rgba(96,112,143,1)]" />
            </div>
            
            <div className="flex-1 space-y-4 w-full pt-4">
              <label className="block text-sm font-mono tracking-widest text-tech-main-dark font-bold border-l-4 border-tech-main pl-3 uppercase">
                AVATAR URL
              </label>
              <BrutalInput
                name="image"
                defaultValue={user.image || ""}
                placeholder="https://..."
                className="font-mono text-sm border-2 border-tech-main bg-white focus:border-tech-main-dark w-full shadow-[2px_2px_0px_0px_rgba(96,112,143,0.3)] transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(96,112,143,0.5)] focus:shadow-[4px_4px_0px_0px_rgba(96,112,143,0.8)]"
              />
              <p className="text-[10px] text-tech-main/60 font-mono uppercase tracking-widest">
                {">"} REQUIRED: DIRECT IMAGE LINK (.PNG/.JPG/.GIF)
              </p>
            </div>
          </div>

          <div className="w-full h-[2px] bg-tech-main/20 my-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-mono tracking-widest text-tech-main-dark font-bold border-l-4 border-tech-main pl-3 uppercase">
                USERNAME
              </label>
              <BrutalInput
                name="name"
                defaultValue={user.name || ""}
                required
                className="font-mono text-sm border-2 border-tech-main bg-white focus:border-tech-main-dark shadow-[2px_2px_0px_0px_rgba(96,112,143,0.3)] transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(96,112,143,0.5)] focus:shadow-[4px_4px_0px_0px_rgba(96,112,143,0.8)]"
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-mono tracking-widest text-tech-main/60 font-bold border-l-4 border-tech-main/30 pl-3 uppercase">
                EMAIL <span className="border border-tech-main/30 px-1.5 py-0.5 text-[10px] bg-tech-main/5 text-tech-main/60">READ_ONLY</span>
              </label>
              <BrutalInput
                defaultValue={user.email || ""}
                disabled
                className="bg-tech-bg text-tech-main/60 border-2 border-tech-main/20 font-mono text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-tech-bg border-2 border-tech-main/20 p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono tracking-widest text-tech-main/60 uppercase">ROLE.ASSIGNMENT:</span>
              <span className="text-lg font-black font-mono tracking-widest text-tech-main-dark uppercase bg-tech-main/10 px-4 py-1 border border-tech-main/30">
                [{user.role}]
              </span>
            </div>
          </div>

          {user.role === "ADMIN" && (
            <div className="space-y-6 bg-[#fdf5f5] p-8 border-[3px] border-[#a65d5d] relative mt-12 shadow-[8px_8px_0px_0px_rgba(166,93,93,0.2)]">
               <div className="absolute -top-4 left-6 bg-[#a65d5d] text-white text-xs font-mono font-bold tracking-widest px-4 py-2 flex items-center gap-3">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                 SUDO // ADMIN SECURE ZONE
               </div>
               
               <div className="pt-2">
                <h3 className="text-base font-black text-[#a65d5d] tracking-widest uppercase">
                  GITHUB PAT TOKEN
                </h3>
                <p className="text-sm font-mono text-[#a65d5d]/70 mt-2">
                  Store your GitHub Personal Access Token to enable restricted PR automation across the platform.
                </p>
                <p className="text-xs font-mono text-[#a65d5d]/50 mt-1 uppercase tracking-widest">
                  {"//"} REQUIRED SCOPES: 'repo', 'workflow'
                </p>
              </div>
              <BrutalInput
                name="githubPat"
                type="password"
                placeholder="****************************************"
                defaultValue={user.githubPat || ""}
                className="font-mono text-sm border-2 border-[#a65d5d]/40 bg-white focus:border-[#a65d5d] text-center tracking-[0.3em] shadow-inner text-[#a65d5d]"
              />
            </div>
          )}

          <div className="w-full h-[2px] bg-tech-main/20 my-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-auto text-left">
              <SignOutButton className="!text-tech-main hover:!text-red-500 font-mono tracking-widest text-sm" />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-tech-main hover:bg-tech-main-dark text-white px-10 py-4 font-mono text-base font-black tracking-widest uppercase transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(74,90,120,0.5)] active:translate-y-0 active:shadow-none"
            >
              SAVE_CONFIGURATION {"//>"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
