import { deleteDraftAsset } from "@/lib/draft-storage"
import { prisma } from "@/lib/prisma"

export async function reconcileDraftAssetsForPRCompletion({
  prNumber,
  outcome,
}: {
  prNumber: number
  outcome: "PR-merged" | "PR-closed"
}): Promise<void> {
  const revision = await prisma.revision.findFirst({
    where: { githubPrNum: prNumber },
    select: { id: true },
  })

  if (!revision) {
    return
  }

  await prisma.revision.update({
    where: { id: revision.id },
    data: {
      status: outcome === "PR-merged" ? "MERGED" : "CLOSED",
    },
  })

  const tempPrefix = process.env.DRAFT_STORAGE_TEMP_PREFIX ?? "draft-temp"
  const assets = await (prisma as any).draftAsset.findMany({
    where: {
      revisionId: revision.id,
      deletedAt: null,
      status: { not: "deleted" },
      storagePath: { startsWith: tempPrefix },
    },
    select: {
      id: true,
      storagePath: true,
    },
  })

  for (const asset of assets) {
    await (prisma as any).draftAsset.updateMany({
      where: {
        id: asset.id,
        deletedAt: null,
        status: { not: "deleted" },
      },
      data: {
        status: outcome,
      },
    })

    try {
      await deleteDraftAsset(asset.storagePath)
      await (prisma as any).draftAsset.updateMany({
        where: { id: asset.id },
        data: {
          status: "deleted",
          deletedAt: new Date(),
        },
      })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      await (prisma as any).draftAsset.updateMany({
        where: { id: asset.id },
        data: {
          status: "cleanup-failed",
          cleanupAttempts: { increment: 1 },
          cleanupFailedAt: new Date(),
          cleanupFailureReason: `[${outcome}] ${reason}`,
        },
      })
    }
  }
}
