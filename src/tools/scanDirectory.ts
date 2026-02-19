import { walk } from "@std/fs";

export interface ScanDirectoryInput {
  path: string;
}

export interface ScanDirectoryOutput {
  files: string[];
  totalFiles: number;
}

export async function scanDirectory(
  input: ScanDirectoryInput
): Promise<ScanDirectoryOutput> {
  const files: string[] = [];
  const extensions = [".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".cpp", ".c", ".go"];

  try {
    for await (const entry of walk(input.path, {
      includeDirs: false,
      exts: extensions.map(ext => ext.slice(1)), // Remove the dot
    })) {
      files.push(entry.path);
    }
  } catch (error) {
    console.error(`Error scanning directory: ${error}`);
  }

  return {
    files,
    totalFiles: files.length,
  };
}