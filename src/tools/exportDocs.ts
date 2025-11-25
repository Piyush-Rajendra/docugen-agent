import { join } from "@std/path";
import { ensureDir } from "@std/fs";

export interface ExportDocsInput {
  documentation: string;
  filePath: string;
  outputDir: string;
}

export interface ExportDocsOutput {
  exportPath: string;
  success: boolean;
}

export async function exportDocs(
  input: ExportDocsInput
): Promise<ExportDocsOutput> {
  try {
    // Ensure output directory exists
    await ensureDir(input.outputDir);

    // Create markdown filename from code file path
    // Replace path separators with underscores to flatten structure
    const fileName = input.filePath
      .replace(/\\/g, "_")
      .replace(/\//g, "_")
      .replace(/\.[^.]+$/, "_docs.md");
    
    const exportPath = join(input.outputDir, fileName);

    // Write documentation to file
    await Deno.writeTextFile(exportPath, input.documentation);

    return {
      exportPath,
      success: true,
    };
  } catch (error) {
    console.error(`Error exporting docs: ${error}`);
    return {
      exportPath: "",
      success: false,
    };
  }
}