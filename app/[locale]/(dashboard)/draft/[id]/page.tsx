import type { Metadata } from "next"
import { DraftEditor } from "@/components/editor/draft-editor"
import { Link } from "@/i18n/navigation"
import { TechButton } from "@/components/ui/tech-button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { decodeStoredDraftFiles } from "@/lib/draft-files"
import { notFound, redirect } from "next/navigation"
import { readFile } from "fs/promises"
import path from "path"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function EditDraftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const draft = await prisma.revision.findUnique({
    where: { id },
  })

  if (!draft || draft.authorId !== session.user.id) {
    notFound()
  }

  const draftFiles = decodeStoredDraftFiles({
    content: draft.content,
    conflictContent: draft.conflictContent,
    filePath: draft.filePath,
  })

  const draftWorkspaceLabel =
    draftFiles.files.length > 1
      ? `FILES_[${draftFiles.files.length}]`
      : draftFiles.files[0]?.filePath || "DRAFT_WORKSPACE"
  const contributingGuides = await loadContributingGuides()

  return (
    <div
      className="
        mx-auto max-w-7xl space-y-6 p-4
        md:p-8
      ">
      <div
        className="
          flex flex-col gap-3 border-b border-tech-main/30 pb-4
          md:flex-row md:items-center md:justify-between
        ">
        <div className="flex items-center gap-4">
          <Link href="/draft">
            <TechButton variant="ghost" size="sm">
              {"<"} BACK TO DRAFTS
            </TechButton>
          </Link>
        </div>
        <p
          className="
            font-mono text-xs tracking-widest text-tech-main/70 uppercase
          ">
          {draftWorkspaceLabel}
        </p>
      </div>

      <div className="mx-auto w-full">
        <DraftEditor
          initialData={{
            activeFileId: draftFiles.activeFileId,
            id: draft.id,
            files: draftFiles.files,
            folders: draftFiles.folders,
            title: draft.title,
            githubPrUrl: draft.githubPrUrl || undefined,
            status: draft.status,
            contributingGuides,
          }}
        />
      </div>
    </div>
  )
}

async function loadContributingGuides() {
  const guideTargets = [
    {
      id: "web",
      title: "GTMC Web",
      filePath: path.join(process.cwd(), "CONTRIBUTING.md"),
    },
    {
      id: "articles",
      title: "Articles",
      filePath: path.join(process.cwd(), "articles", "CONTRIBUTING.md"),
    },
  ]

  const guides = await Promise.all(
    guideTargets.map(async (guide) => {
      try {
        const content = await readFile(guide.filePath, "utf8")
        return {
          id: guide.id,
          title: guide.title,
          content,
        }
      } catch {
        return null
      }
    })
  )

  return guides.filter(
    (
      guide
    ): guide is {
      id: string
      title: string
      content: string
    } => Boolean(guide)
  )
}
