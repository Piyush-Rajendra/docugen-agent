import type { GitHubFileNode } from "./githubFetch.ts";

export interface SelectFilesInput {
  files: GitHubFileNode[];
}

export interface SelectFilesOutput {
  selectedFiles: string[];
}

// Build a simple tree visualization
function buildTreeView(files: GitHubFileNode[]): string[] {
  const lines: string[] = [];
  const grouped = new Map<string, string[]>();

  // Group files by directory
  files.forEach(file => {
    const parts = file.path.split("/");
    if (parts.length === 1) {
      if (!grouped.has("root")) grouped.set("root", []);
      grouped.get("root")!.push(file.path);
    } else {
      const dir = parts.slice(0, -1).join("/");
      if (!grouped.has(dir)) grouped.set(dir, []);
      grouped.get(dir)!.push(file.path);
    }
  });

  // Build tree view
  lines.push("\n📦 Repository Files:");
  let index = 0;
  for (const [dir, fileList] of grouped) {
    if (dir !== "root") {
      lines.push(`\n📁 ${dir}/`);
    }
    for (const file of fileList) {
      const fileName = file.split("/").pop()!;
      lines.push(`  [${index}] 📄 ${fileName} (${file})`);
      index++;
    }
  }

  return lines;
}

// Simple interactive file selection
export async function selectFiles(
  input: SelectFilesInput
): Promise<SelectFilesOutput> {
  const treeView = buildTreeView(input.files);
  
  console.log(treeView.join("\n"));
  console.log("\n" + "─".repeat(60));
  console.log("📝 Enter file numbers to document (comma-separated)");
  console.log("   Example: 0,2,5  OR  'all' for all files");
  console.log("─".repeat(60));

  // Read user input
  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  const userInput = new TextDecoder().decode(buf.subarray(0, n!)).trim();

  let selectedFiles: string[];

  if (userInput.toLowerCase() === "all") {
    selectedFiles = input.files.map(f => f.path);
  } else {
    const indices = userInput.split(",").map(s => parseInt(s.trim()));
    selectedFiles = indices
      .filter(i => i >= 0 && i < input.files.length)
      .map(i => input.files[i].path);
  }

  console.log(`\n✅ Selected ${selectedFiles.length} files for documentation\n`);

  return { selectedFiles };
}