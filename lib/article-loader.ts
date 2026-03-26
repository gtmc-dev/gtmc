import fs from "fs"
import path from "path"
import {
  getRepoFileContent,
  getRepoFileBuffer,
  getRepoContentTree,
  type RepoTreeNode,
} from "./github-pr"

const ARTICLES_DIR = path.join(process.cwd(), "articles")
const SUBMODULE_GIT = path.join(ARTICLES_DIR, ".git")

export function isSubmoduleAvailable(): boolean {
  return fs.existsSync(SUBMODULE_GIT)
}

export async function getArticleContent(
  filePath: string
): Promise<string | null> {
  if (isSubmoduleAvailable()) {
    const localPath = path.join(ARTICLES_DIR, filePath)
    try {
      return fs.readFileSync(localPath, "utf-8")
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[article-loader] File not in submodule: ${filePath}, falling back to API`
        )
      }
    }
  }
  if (process.env.NODE_ENV === "development" && !isSubmoduleAvailable()) {
    console.warn("[article-loader] Submodule not available, using API")
  }
  return await getRepoFileContent(filePath)
}

export async function getArticleTree(): Promise<RepoTreeNode[]> {
  throw new Error("not implemented")
}

export async function getArticleBuffer(
  filePath: string
): Promise<Buffer | null> {
  throw new Error("not implemented")
}
