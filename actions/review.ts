"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  ARTICLES_REPO_NAME,
  ARTICLES_REPO_OWNER,
  getOctokit,
} from "@/lib/github-pr";

const owner = ARTICLES_REPO_OWNER;
const repo = ARTICLES_REPO_NAME;

export async function mergePRAction(prNumber: number) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const token = (session.user as { githubPat?: string }).githubPat || process.env.GITHUB_TOKEN;
  const octokit = getOctokit(token);

  try {
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
    });
    revalidatePath("/review");
    return { success: true };
  } catch (error) {
    throw new Error(`Merge failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function closePRAction(prNumber: number) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const token = (session.user as { githubPat?: string }).githubPat || process.env.GITHUB_TOKEN;
  const octokit = getOctokit(token);

  try {
    await octokit.pulls.update({
      owner,
      repo,
      pull_number: prNumber,
      state: "closed",
    });
    revalidatePath("/review");
    return { success: true };
  } catch (error) {
    throw new Error(`Close failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
