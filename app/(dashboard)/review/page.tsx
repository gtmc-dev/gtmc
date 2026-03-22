import { BrutalCard } from "@/components/ui/brutal-card"
import { BrutalButton } from "@/components/ui/brutal-button"
import Link from "next/link"
import { getOpenPRs } from "@/lib/github-pr"
import { auth } from "@/lib/auth"

export default async function ReviewHubPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="mx-auto mt-20 max-w-6xl p-8 text-center">
        <h1 className="text-6xl font-black text-red-500 uppercase">
          ACCESS DENIED
        </h1>
        <p className="mt-4 text-xl font-bold">
          ADMIN CLEARANCE REQUIRED.
        </p>
        <Link href="/">
          <BrutalButton variant="primary" className="mt-8">
            RETURN TO BASE
          </BrutalButton>
        </Link>
      </div>
    )
  }

  // Fetch PRs from GitHub using admin's PAT or default SERVER TOKEN
  const token = process.env.GITHUB_ARTICLES_WRITE_PAT
  let openPRs: Array<{
    id: number
    number: number
    created_at: string
    title: string
    user: { login: string } | null
    head: { ref: string }
  }> = []
  try {
    const prs = await getOpenPRs(token)
    openPRs = prs as unknown as typeof openPRs
  } catch (error) {
    console.error("Failed to fetch PRs:", error)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6">
      <div className="relative border-b border-tech-main/40 pb-6">
        <div className="
          absolute top-0 right-0 size-8 translate-x-px -translate-y-px border-t
          border-r border-tech-main/20
        "></div>
        <h1 className="
          flex items-center text-2xl font-bold tracking-tight
          text-tech-main-dark uppercase
          md:text-4xl
        ">
          <span className="
            mr-4 size-4 border border-tech-main/40 bg-tech-main/20
          "></span>
          REVIEW HUB
        </h1>
        <p className="
          mt-3 flex items-center font-mono text-xs tracking-widest
          text-tech-main/80
          sm:text-sm
        ">
          <span className="mr-2 size-2 animate-pulse rounded-full bg-tech-main"></span>
          APPROVE CONTENT. MERGE REBELLION.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {openPRs.length === 0 ? (
          <div className="
            group relative border border-dashed border-tech-main/40 bg-white/30
            py-16 text-center backdrop-blur-sm
          ">
            <div className="
              absolute inset-0
              bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(96,112,143,0.05)_10px,rgba(96,112,143,0.05)_20px)]
            "></div>
            <h2 className="
              relative z-10 font-mono text-lg tracking-widest text-tech-main/50
              uppercase
            ">
              NO PENDING REVIEWS. SILENCE IN THE COMM.
            </h2>
          </div>
        ) : (
          openPRs.map((pr) => (
            <BrutalCard
              key={pr.id}
              className="
                group relative flex flex-col items-start justify-between
                space-y-4 border border-tech-main/40 bg-white/80 p-6
                backdrop-blur-sm
                md:flex-row md:items-center md:space-y-0
              ">
              <div className="
                absolute top-0 left-0 size-2 -translate-px border-t-2 border-l-2
                border-tech-main/40 opacity-0 transition-opacity
                group-hover:opacity-100
              "></div>
              <div className="
                absolute right-0 bottom-0 size-2 translate-px border-r-2
                border-b-2 border-tech-main/40 opacity-0 transition-opacity
                group-hover:opacity-100
              "></div>

              <div className="relative z-10 flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className="
                    border border-blue-500/40 bg-blue-500/10 px-2 py-0.5
                    font-mono text-xs tracking-wider text-blue-600
                  ">
                    [PR #{pr.number}]
                  </span>
                  <span className="font-mono text-xs text-tech-main/50">
                    {new Date(pr.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="
                  mb-2 border-l-2 border-tech-main/40 pl-3 text-lg font-bold
                  tracking-tight text-tech-main-dark uppercase
                  md:text-xl
                ">
                  {pr.title || "UNTITLED"}
                </h3>
                <p className="mb-3 pl-3 font-mono text-xs text-tech-main/80">
                  Submitted by:{" "}
                  <span className="font-bold text-tech-main-dark">
                    {pr.user?.login || "UNKNOWN"}
                  </span>
                </p>
                <p className="
                  ml-3 inline-flex items-center border border-tech-main/20
                  bg-tech-main/5 px-2 py-1 font-mono text-xs text-tech-main
                ">
                  <span className="mr-2 size-1.5 bg-tech-main"></span>{" "}
                  TARGET: {pr.head.ref}
                </p>
              </div>

              <div className="
                relative z-10 flex w-full flex-col gap-4
                md:w-auto md:flex-row
              ">
                <Link
                  href={`/review/${pr.number}`}
                  className="
                    w-full
                    md:w-auto
                  ">
                  <BrutalButton
                    variant="primary"
                    className="
                      flex min-h-[44px] w-full items-center justify-center px-6
                      text-xs tracking-widest uppercase transition-transform
                      hover:scale-[1.02]
                      md:w-auto
                    ">
                    REVIEW CONTENT →
                  </BrutalButton>
                </Link>
              </div>
            </BrutalCard>
          ))
        )}
      </div>
    </div>
  )
}
