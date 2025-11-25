import * as path from "@std/path";
import type { ToolContext, ToolResult, RepoInfo } from "./types.ts";

/**
 * Clones a GitHub repository to a temporary directory
 */
export async function cloneRepository(
  repoUrl: string,
  ctx: ToolContext,
): Promise<ToolResult> {
  try {
    console.log(`\n📦 Cloning repository: ${repoUrl}`);

    // Extract repo name from URL
    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";

    // Create temp directory
    const tempDir = path.join(ctx.workingDirectory, "temp");
    await Deno.mkdir(tempDir, { recursive: true });

    const localPath = path.join(tempDir, repoName);

    // Remove existing directory if it exists
    try {
      await Deno.remove(localPath, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }

    // Clone the repository
    const cloneProcess = new Deno.Command("git", {
      args: ["clone", "--depth", "1", repoUrl, localPath],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await cloneProcess.output();

    if (code !== 0) {
      const errorMsg = new TextDecoder().decode(stderr);
      throw new Error(`Git clone failed: ${errorMsg}`);
    }

    const repoInfo: RepoInfo = {
      url: repoUrl,
      name: repoName,
      localPath: localPath,
    };

    console.log(`  Successfully cloned to: ${localPath}\n`);

    return {
      success: true,
      data: repoInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clone repository: ${error.message}`,
    };
  }
}

/**
 * Lists directories in a repository
 */
export async function listRepoDirectories(
  repoPath: string,
  ctx: ToolContext,
): Promise<ToolResult> {
  try {
    const resolvedPath = path.resolve(ctx.workingDirectory, repoPath);
    const directories: string[] = [];

    console.log(`  Scanning repository structure...\n`);

    for await (const entry of Deno.readDir(resolvedPath)) {
      if (
        entry.isDirectory &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        directories.push(entry.name);
      }
    }

    directories.sort();

    if (directories.length === 0) {
      console.log("   No subdirectories found (will use root directory)\n");
    } else {
      console.log("Available directories:");
      directories.forEach((dir, idx) => {
        console.log(`  ${idx + 1}. ${dir}`);
      });
      console.log("");
    }

    return {
      success: true,
      data: {
        directories,
        repoPath: resolvedPath,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list directories: ${error.message}`,
    };
  }
}