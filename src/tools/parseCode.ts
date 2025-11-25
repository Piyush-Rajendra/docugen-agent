import type { CodeElement } from "../types/index.ts";

export interface ParseCodeInput {
  filePath: string;
}

export interface ParseCodeOutput {
  filePath: string;
  elements: CodeElement[];
}

export async function parseCode(
  input: ParseCodeInput
): Promise<ParseCodeOutput> {
  const content = await Deno.readTextFile(input.filePath);
  const elements: CodeElement[] = [];

  // Simple regex-based parsing for TypeScript/JavaScript
  // Functions
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "function",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // Classes
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "class",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // Interfaces
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "interface",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // Types
  const typeRegex = /(?:export\s+)?type\s+(\w+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "type",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  return {
    filePath: input.filePath,
    elements,
  };
}