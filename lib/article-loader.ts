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
  throw new Error("not implemented")
}

export async function getArticleTree(): Promise<RepoTreeNode[]> {
  throw new Error("not implemented")
}

export async function getArticleBuffer(
  filePath: string
): Promise<Buffer | null> {
  throw new Error("not implemented")
}
