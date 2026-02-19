import { assertEquals, assertExists } from "jsr:@std/assert";
import { parseGitHubUrl } from "./githubFetch.ts";

// ── parseGitHubUrl ────────────────────────────
// These tests are pure (no network) and run instantly.

Deno.test("parseGitHubUrl: parses standard https URL", () => {
  const result = parseGitHubUrl("https://github.com/expressjs/express");
  assertExists(result);
  assertEquals(result!.owner, "expressjs");
  assertEquals(result!.repo, "express");
});

Deno.test("parseGitHubUrl: strips .git suffix", () => {
  const result = parseGitHubUrl("https://github.com/user/my-repo.git");
  assertExists(result);
  assertEquals(result!.repo, "my-repo");
});

Deno.test("parseGitHubUrl: handles URL with trailing slash or path", () => {
  const result = parseGitHubUrl("https://github.com/denoland/deno/tree/main/cli");
  assertExists(result);
  assertEquals(result!.owner, "denoland");
  assertEquals(result!.repo, "deno");
});

Deno.test("parseGitHubUrl: returns null for non-GitHub URL", () => {
  const result = parseGitHubUrl("https://gitlab.com/user/repo");
  assertEquals(result, null);
});

Deno.test("parseGitHubUrl: returns null for empty string", () => {
  const result = parseGitHubUrl("");
  assertEquals(result, null);
});

Deno.test("parseGitHubUrl: handles http (non-https) URL", () => {
  const result = parseGitHubUrl("http://github.com/octocat/Hello-World");
  assertExists(result);
  assertEquals(result!.owner, "octocat");
  assertEquals(result!.repo, "Hello-World");
});

// ── fetchRepoTree / fetchFileContent ──────────
// Network tests - skip if GITHUB_TEST is not set to avoid flakiness in CI.
// Run with: GITHUB_TEST=1 deno task test

const GITHUB_TEST = Deno.env.get("GITHUB_TEST") === "1";

Deno.test({
  name: "fetchRepoTree: fetches a real public repo (network)",
  ignore: !GITHUB_TEST,
  async fn() {
    const { fetchRepoTree } = await import("./githubFetch.ts");
    const result = await fetchRepoTree({ owner: "nicolo-ribaudo", repo: "tc39-proposal-decimal" });
    assertEquals(result.success, true);
    assertEquals(result.tree.length > 0, true);
    // Every item should be a file
    for (const item of result.tree) {
      assertEquals(item.type, "file");
    }
  },
});

Deno.test({
  name: "fetchFileContent: fetches a real file (network)",
  ignore: !GITHUB_TEST,
  async fn() {
    const { fetchFileContent } = await import("./githubFetch.ts");
    const result = await fetchFileContent({
      owner: "nicolo-ribaudo",
      repo: "tc39-proposal-decimal",
      path: "README.md",
    });
    // README.md is not a code file but the API will still return it
    assertEquals(result.success, true);
    assertEquals(result.content.length > 0, true);
  },
});
