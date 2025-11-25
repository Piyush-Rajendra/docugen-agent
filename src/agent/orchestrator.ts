import { scanDirectory } from "../tools/scanDirectory.ts";
import { parseCode } from "../tools/parseCode.ts";
import { generateDocs } from "../tools/generateDocs.ts";
import { exportDocs } from "../tools/exportDocs.ts";
import {
  parseGitHubUrl,
  fetchRepoTree,
  fetchFileContent,
} from "../tools/githubFetch.ts";
import { selectFiles } from "../tools/interactiveCLI.ts";

export interface AgentConfig {
  targetDir?: string;
  githubUrl?: string;
  outputDir: string;
  apiKey: string;
}

export async function runDocGenAgent(config: AgentConfig): Promise<void> {
  console.log("\n   DocuGen Agent - AI-Powered Documentation Generator");
  console.log("━".repeat(60));
  
  let filesToProcess: string[] = [];
  let isGitHub = false;
  let githubInfo: { owner: string; repo: string } | null = null;

  // Determine mode: Local or GitHub
  if (config.githubUrl) {
    isGitHub = true;
    console.log(`    Mode: GitHub Repository`);
    console.log(`  URL: ${config.githubUrl}`);
    console.log(`  Output: ${config.outputDir}`);
    console.log("━".repeat(60));

    // Parse GitHub URL
    githubInfo = parseGitHubUrl(config.githubUrl);
    if (!githubInfo) {
      console.error("  Invalid GitHub URL format");
      return;
    }

    // Fetch repository tree
    console.log("\nStep 1: Fetching repository structure...");
    const treeResult = await fetchRepoTree({
      owner: githubInfo.owner,
      repo: githubInfo.repo,
    });

    if (!treeResult.success || treeResult.tree.length === 0) {
      console.error("  Failed to fetch repository or no code files found");
      return;
    }

    console.log(`  Found ${treeResult.tree.length} code files\n`);

    // Interactive file selection
    const selection = await selectFiles({ files: treeResult.tree });
    filesToProcess = selection.selectedFiles;

    if (filesToProcess.length === 0) {
      console.log("  No files selected");
      return;
    }
  } else if (config.targetDir) {
    console.log(`  Mode: Local Directory`);
    console.log(`  Target: ${config.targetDir}`);
    console.log(`  Output: ${config.outputDir}`);
    console.log("━".repeat(60));

    // Scan local directory
    console.log("\nStep 1: Scanning directory...");
    const scanResult = await scanDirectory({ path: config.targetDir });
    console.log(`  Found ${scanResult.files.length} code files\n`);
    filesToProcess = scanResult.files;
  } else {
    console.error("  Must specify either --target or --github");
    return;
  }

  // Step 2: Parse each file
  console.log("Step 2: Parsing code files...");
  const parsedFiles = [];

  for (const file of filesToProcess) {
    console.log(`     Parsing: ${file}`);

    let fileContent = "";
    
    if (isGitHub && githubInfo) {
      // Fetch file content from GitHub
      const contentResult = await fetchFileContent({
        owner: githubInfo.owner,
        repo: githubInfo.repo,
        path: file,
      });
      
      if (!contentResult.success) {
        console.log(`      Skipping (fetch failed): ${file}`);
        continue;
      }
      
      fileContent = contentResult.content;
      
      // Write to temp file for parsing
      const tempDir = Deno.env.get("TEMP") || Deno.env.get("TMP") || "./temp";
      await Deno.mkdir(tempDir, { recursive: true }).catch(() => {});
      const tempPath = `${tempDir}/${file.replace(/\//g, "_").replace(/\\/g, "_")}`;
      await Deno.writeTextFile(tempPath, fileContent);
      
      const parseResult = await parseCode({ filePath: tempPath });
      parseResult.filePath = file; // Use original path
      
      if (parseResult.elements.length > 0) {
        parsedFiles.push(parseResult);
      }
      
      // Clean up temp file
      try {
        await Deno.remove(tempPath);
      } catch (_e) {
        // Ignore cleanup errors
      }
    } else {
      // Local file parsing
      const parseResult = await parseCode({ filePath: file });
      if (parseResult.elements.length > 0) {
        parsedFiles.push(parseResult);
      }
    }
  }
  
  console.log(`  Parsed ${parsedFiles.length} files with code elements\n`);

  if (parsedFiles.length === 0) {
    console.log("  No code elements found to document");
    return;
  }

  // Step 3: Generate documentation with Claude
  console.log("Step 3: Generating documentation with Claude AI...");
  const documentedFiles = [];
  
  for (const parsed of parsedFiles) {
    console.log(`      Documenting: ${parsed.filePath}`);
    const docsResult = await generateDocs(
      {
        elements: parsed.elements,
        filePath: parsed.filePath,
      },
      config.apiKey
    );
    documentedFiles.push(docsResult);
  }
  
  console.log(`  Generated documentation for ${documentedFiles.length} files\n`);

  // Step 4: Export to markdown
  console.log("Step 4: Exporting documentation...");
  for (const doc of documentedFiles) {
    const exportResult = await exportDocs({
      documentation: doc.documentation,
      filePath: doc.filePath,
      outputDir: config.outputDir,
    });
    
    if (exportResult.success) {
      console.log(`     Exported: ${exportResult.exportPath}`);
    }
  }

  console.log("\n" + "━".repeat(60));
  console.log("  Documentation generation complete!");
  console.log("━".repeat(60) + "\n");
}