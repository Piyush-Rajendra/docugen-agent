import { assertEquals } from "jsr:@std/assert";
import { exportDocs } from "./exportDocs.ts";
import { join } from "@std/path";

Deno.test("exportDocs: writes markdown file to output dir", async () => {
  const tmpDir = await Deno.makeTempDir();
  try {
    const result = await exportDocs({
      documentation: "# Hello\nSome docs.",
      filePath: "src/utils/helper.ts",
      outputDir: tmpDir,
    });

    assertEquals(result.success, true);
    const content = await Deno.readTextFile(result.exportPath);
    assertEquals(content, "# Hello\nSome docs.");
  } finally {
    await Deno.remove(tmpDir, { recursive: true });
  }
});

Deno.test("exportDocs: filename flattens path separators", async () => {
  const tmpDir = await Deno.makeTempDir();
  try {
    const result = await exportDocs({
      documentation: "docs",
      filePath: "src/tools/parseCode.ts",
      outputDir: tmpDir,
    });

    assertEquals(result.success, true);
    // Slashes replaced with underscores, extension replaced with _docs.md
    assertEquals(result.exportPath.endsWith("src_tools_parseCode_docs.md"), true);
  } finally {
    await Deno.remove(tmpDir, { recursive: true });
  }
});

Deno.test("exportDocs: creates output directory if missing", async () => {
  const tmpDir = await Deno.makeTempDir();
  const nestedDir = join(tmpDir, "a", "b", "c");
  try {
    const result = await exportDocs({
      documentation: "content",
      filePath: "file.ts",
      outputDir: nestedDir,
    });

    assertEquals(result.success, true);
    const stat = await Deno.stat(nestedDir);
    assertEquals(stat.isDirectory, true);
  } finally {
    await Deno.remove(tmpDir, { recursive: true });
  }
});

Deno.test("exportDocs: returns success false on bad output path", async () => {
  // Use a path that cannot be created (file used as directory)
  const tmpFile = await Deno.makeTempFile();
  try {
    const result = await exportDocs({
      documentation: "content",
      filePath: "file.ts",
      outputDir: join(tmpFile, "impossible"), // tmpFile is a file, not a dir
    });

    assertEquals(result.success, false);
    assertEquals(result.exportPath, "");
  } finally {
    await Deno.remove(tmpFile);
  }
});
