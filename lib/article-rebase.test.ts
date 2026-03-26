// @ts-ignore Bun provides this module in test runtime.
import { describe, expect, it, beforeEach, mock } from "bun:test"

const mockCompareCommits = mock()
const mockGetCommit = mock()
const mockGetContent = mock()

mock.module("@/lib/github-pr", () => ({
  getOctokit: mock(() => ({
    repos: {
      compareCommits: mockCompareCommits,
      getCommit: mockGetCommit,
      getContent: mockGetContent,
    },
  })),
  ARTICLES_REPO_OWNER: "gtmc-dev",
  ARTICLES_REPO_NAME: "Articles",
}))

mock.module("@/lib/prisma", () => ({
  prisma: {
    revision: {
      update: mock(async () => ({})),
    },
  },
}))

const { rebaseArticleContent, analyzeRebaseNeed } =
  await import("./article-rebase")
import type { RebaseInput, AnalyzeRebaseInput } from "./article-rebase"

describe("rebaseArticleContent", () => {
  beforeEach(() => {
    mockCompareCommits.mockReset()
    mockGetCommit.mockReset()
    mockGetContent.mockReset()
    mockCompareCommits.mockImplementation(async () => ({
      data: { commits: [] },
    }))
    mockGetCommit.mockImplementation(async () => ({ data: { files: [] } }))
    mockGetContent.mockImplementation(async () => ({
      data: { type: "file", content: "", sha: "" },
    }))
  })

  it("NO_CHANGE: baseMainSha === latestMainSha", async () => {
    const input: RebaseInput = {
      draftId: "draft-1",
      filePath: "test.md",
      baseMainSha: "abc123",
      latestMainSha: "abc123",
      draftContent: "draft content",
    }

    const result = await rebaseArticleContent(input)

    expect(result.status).toBe("NO_CHANGE")
    expect(result).toHaveProperty("message")
  })

  it("NO_CHANGE: no commits modified the file", async () => {
    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "commit1",
            commit: {
              message: "Update other file",
              author: { name: "Author", date: "2024-01-01" },
            },
          },
        ],
      },
    }))
    mockGetCommit.mockImplementation(async () => ({
      data: { files: [{ filename: "other.md" }] },
    }))

    const input: RebaseInput = {
      draftId: "draft-1",
      filePath: "test.md",
      baseMainSha: "abc123",
      latestMainSha: "def456",
      draftContent: "draft content",
    }

    const result = await rebaseArticleContent(input)

    expect(result.status).toBe("NO_CHANGE")
  })

  it("SUCCESS: 2 commits, both modify file, no conflicts", async () => {
    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "c1",
            commit: {
              message: "First",
              author: { name: "A1", date: "2024-01-01" },
            },
          },
          {
            sha: "c2",
            commit: {
              message: "Second",
              author: { name: "A2", date: "2024-01-02" },
            },
          },
        ],
      },
    }))

    mockGetCommit.mockImplementation(async () => {
      return { data: { files: [{ filename: "test.md" }] } }
    })

    const contentMap: Record<string, string> = {
      abc: "line1",
      c1: "line1\nline2",
      c2: "line1\nline2\nline3",
    }
    mockGetContent.mockImplementation(async ({ ref }: any) => ({
      data: {
        type: "file",
        content: Buffer.from(contentMap[ref] || "").toString("base64"),
        sha: "s" + ref,
      },
    }))

    const result = await rebaseArticleContent({
      draftId: "draft-1",
      filePath: "test.md",
      baseMainSha: "abc",
      latestMainSha: "def",
      draftContent: "line1\nline2",
    })

    expect(result.status).toBe("SUCCESS")
    if (result.status === "SUCCESS") {
      expect(result.appliedCommits).toHaveLength(2)
    }
  })

  it("CONFLICT: 2 commits, commit 2 conflicts", async () => {
    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "c1",
            commit: {
              message: "First",
              author: { name: "A1", date: "2024-01-01" },
            },
          },
          {
            sha: "c2",
            commit: {
              message: "Conflict",
              author: { name: "A2", date: "2024-01-02" },
            },
          },
        ],
      },
    }))

    mockGetCommit.mockImplementation(async () => {
      return { data: { files: [{ filename: "test.md" }] } }
    })

    const contentMap: Record<string, string> = {
      abc: "line1",
      c1: "line1\nline2",
      c2: "line1\nline2\nline3",
    }
    mockGetContent.mockImplementation(async ({ ref }: any) => ({
      data: {
        type: "file",
        content: Buffer.from(contentMap[ref] || "").toString("base64"),
        sha: "s" + ref,
      },
    }))

    const result = await rebaseArticleContent({
      draftId: "draft-1",
      filePath: "test.md",
      baseMainSha: "abc",
      latestMainSha: "def",
      draftContent: "line1\nline2\ndraft",
    })

    expect(result.status).toBe("CONFLICT")
    if (result.status === "CONFLICT") {
      expect(result.conflictCommit.sha).toBe("c1")
    }
  })

  it("SUCCESS with irrelevant commits: 3 commits, only 1 modifies file", async () => {
    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "c1",
            commit: {
              message: "Other",
              author: { name: "A1", date: "2024-01-01" },
            },
          },
          {
            sha: "c2",
            commit: {
              message: "Target",
              author: { name: "A2", date: "2024-01-02" },
            },
          },
          {
            sha: "c3",
            commit: {
              message: "Another",
              author: { name: "A3", date: "2024-01-03" },
            },
          },
        ],
      },
    }))

    const commitMap: Record<string, any> = {
      c1: { data: { files: [{ filename: "other.md" }] } },
      c2: { data: { files: [{ filename: "test.md" }] } },
      c3: { data: { files: [{ filename: "another.md" }] } },
    }
    mockGetCommit.mockImplementation(async ({ ref }: any) => {
      return commitMap[ref] || { data: { files: [] } }
    })

    const contentMap: Record<string, string> = {
      abc: "base",
      c2: "base\nupdated",
    }
    mockGetContent.mockImplementation(async ({ ref }: any) => ({
      data: {
        type: "file",
        content: Buffer.from(contentMap[ref] || "").toString("base64"),
        sha: "s" + ref,
      },
    }))

    const result = await rebaseArticleContent({
      draftId: "draft-1",
      filePath: "test.md",
      baseMainSha: "abc",
      latestMainSha: "def",
      draftContent: "base\nupdated",
    })

    expect(result.status).toBe("SUCCESS")
    if (result.status === "SUCCESS") {
      expect(result.appliedCommits).toHaveLength(1)
      expect(result.appliedCommits[0].sha).toBe("c2")
    }
  })
})

describe("analyzeRebaseNeed", () => {
  beforeEach(() => {
    mockCompareCommits.mockReset()
    mockGetCommit.mockReset()
    mockCompareCommits.mockImplementation(async () => ({
      data: { commits: [] },
    }))
    mockGetCommit.mockImplementation(async () => ({ data: { files: [] } }))
  })

  it("returns QUICK_MERGE_OK when baseMainSha === latestMainSha", async () => {
    const input: AnalyzeRebaseInput = {
      filePath: "test.md",
      baseMainSha: "abc123",
      latestMainSha: "abc123",
    }

    const result = await analyzeRebaseNeed(input)

    expect(result.recommendation).toBe("QUICK_MERGE_OK")
    expect(result.totalCommits).toBe(0)
    expect(result.fileEditCount).toBe(0)
    expect(result.commitInfos).toHaveLength(0)
    expect(result.adminMessage).toBe(
      "No changes in main since draft was created."
    )
  })

  it("returns REBASE_RECOMMENDED when file modified in multiple commits", async () => {
    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "c1",
            commit: {
              message: "Edit article part 1",
              author: { name: "A1", date: "2024-01-01" },
            },
          },
          {
            sha: "c2",
            commit: {
              message: "Edit article part 2",
              author: { name: "A2", date: "2024-01-02" },
            },
          },
          {
            sha: "c3",
            commit: {
              message: "Edit article part 3",
              author: { name: "A3", date: "2024-01-03" },
            },
          },
          {
            sha: "c4",
            commit: {
              message: "Other file change",
              author: { name: "A4", date: "2024-01-04" },
            },
          },
          {
            sha: "c5",
            commit: {
              message: "Another other change",
              author: { name: "A5", date: "2024-01-05" },
            },
          },
        ],
      },
    }))

    const commitFileMap: Record<string, string[]> = {
      c1: ["test.md"],
      c2: ["test.md"],
      c3: ["test.md"],
      c4: ["other.md"],
      c5: ["another.md"],
    }
    mockGetCommit.mockImplementation(async ({ ref }: any) => ({
      data: {
        files: (commitFileMap[ref] || []).map((filename) => ({ filename })),
      },
    }))

    const input: AnalyzeRebaseInput = {
      filePath: "test.md",
      baseMainSha: "base",
      latestMainSha: "latest",
    }

    const result = await analyzeRebaseNeed(input)

    expect(result.recommendation).toBe("REBASE_RECOMMENDED")
    expect(result.totalCommits).toBe(5)
    expect(result.fileEditCount).toBe(3)
    expect(result.commitInfos).toHaveLength(3)
    expect(result.adminMessage).toBe(
      "The article was modified in 3 separate commits. Fine-grained rebase is recommended to resolve each change individually."
    )
  })

  it("returns QUICK_MERGE_OK when file modified in 0 or 1 commit", async () => {
    const inputZero: AnalyzeRebaseInput = {
      filePath: "test.md",
      baseMainSha: "base",
      latestMainSha: "latest",
    }

    const resultZero = await analyzeRebaseNeed(inputZero)

    expect(resultZero.recommendation).toBe("QUICK_MERGE_OK")
    expect(resultZero.fileEditCount).toBe(0)
    expect(resultZero.adminMessage).toBe(
      "The article was modified in no commit. A quick merge should suffice."
    )

    mockCompareCommits.mockImplementation(async () => ({
      data: {
        commits: [
          {
            sha: "c1",
            commit: {
              message: "Edit article",
              author: { name: "A1", date: "2024-01-01" },
            },
          },
          {
            sha: "c2",
            commit: {
              message: "Unrelated",
              author: { name: "A2", date: "2024-01-02" },
            },
          },
        ],
      },
    }))

    const commitFileMap: Record<string, string[]> = {
      c1: ["test.md"],
      c2: ["other.md"],
    }
    mockGetCommit.mockImplementation(async ({ ref }: any) => ({
      data: {
        files: (commitFileMap[ref] || []).map((filename) => ({ filename })),
      },
    }))

    const inputOne: AnalyzeRebaseInput = {
      filePath: "test.md",
      baseMainSha: "base",
      latestMainSha: "latest",
    }

    const resultOne = await analyzeRebaseNeed(inputOne)

    expect(resultOne.recommendation).toBe("QUICK_MERGE_OK")
    expect(resultOne.fileEditCount).toBe(1)
    expect(resultOne.totalCommits).toBe(2)
    expect(resultOne.adminMessage).toBe(
      "The article was modified in 1 commit. A quick merge should suffice."
    )
  })
})
