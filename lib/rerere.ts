import { createHash } from "node:crypto"

import { prisma } from "@/lib/prisma"

export interface ConflictBlock {
  id: string
  filePath: string
  base: string
  ours: string
  theirs: string
  autoApplied?: { resolution: string; source: "rerere" }
}

function normalizeInput(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd()
}

export function computeConflictHash(
  filePath: string,
  base: string,
  ours: string,
  theirs: string
): string {
  const normalizedPayload = JSON.stringify({
    filePath: normalizeInput(filePath),
    base: normalizeInput(base),
    ours: normalizeInput(ours),
    theirs: normalizeInput(theirs),
  })

  return createHash("sha256").update(normalizedPayload).digest("hex")
}

export async function lookupRerere(
  conflictHash: string
): Promise<string | null> {
  const record = await prisma.conflictResolution.findUnique({
    where: { conflictHash },
    select: { resolution: true },
  })

  return record?.resolution ?? null
}

export async function storeRerere(
  filePath: string,
  base: string,
  ours: string,
  theirs: string,
  resolution: string
): Promise<void> {
  const conflictHash = computeConflictHash(filePath, base, ours, theirs)

  await prisma.conflictResolution.upsert({
    where: { conflictHash },
    create: {
      conflictHash,
      filePath,
      resolution,
    },
    update: {
      filePath,
      resolution,
    },
  })
}

export async function autoApplyRerere(blocks: ConflictBlock[]): Promise<{
  applied: ConflictBlock[]
  remaining: ConflictBlock[]
}> {
  const resolutions = await Promise.all(
    blocks.map(async (block) => ({
      block,
      resolution: await lookupRerere(
        computeConflictHash(
          block.filePath,
          block.base,
          block.ours,
          block.theirs
        )
      ),
    }))
  )

  const applied: ConflictBlock[] = []
  const remaining: ConflictBlock[] = []

  for (const { block, resolution } of resolutions) {
    if (resolution !== null) {
      applied.push({
        ...block,
        autoApplied: {
          resolution,
          source: "rerere",
        },
      })
      continue
    }

    remaining.push(block)
  }

  return { applied, remaining }
}
