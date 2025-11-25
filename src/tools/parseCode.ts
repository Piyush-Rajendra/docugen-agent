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

  // Functions - multiple patterns for JS/TS
  const functionPatterns = [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,  // function name()
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/g,  // const name = function
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,  // const name = () =>
    /(?:export\s+)?let\s+(\w+)\s*=\s*(?:async\s+)?function/g,  // let name = function
    /(?:export\s+)?let\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,  // let name = () =>
    /(\w+)\s*:\s*(?:async\s+)?function/g,  // name: function (object methods)
    /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/g,  // name: () => (object methods)
  ];

  let match;
  const foundNames = new Set<string>();

  for (const pattern of functionPatterns) {
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      if (!foundNames.has(name) && name !== 'require' && name !== 'exports') {
        foundNames.add(name);
        elements.push({
          name,
          type: "function",
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    }
  }

  // Express routes (router.get, router.post, etc.)
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    elements.push({
      name: `${method} ${path}`,
      type: "route",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // App routes (app.get, app.post, etc.)
  const appRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = appRouteRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    elements.push({
      name: `${method} ${path}`,
      type: "route",
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

  // Interfaces (TypeScript)
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "interface",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // Types (TypeScript)
  const typeRegex = /(?:export\s+)?type\s+(\w+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    elements.push({
      name: match[1],
      type: "type",
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  // If we found nothing, at least capture module.exports
  if (elements.length === 0) {
    const exportsRegex = /module\.exports\s*=\s*(\w+)/g;
    while ((match = exportsRegex.exec(content)) !== null) {
      elements.push({
        name: match[1],
        type: "export",
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  }

  return {
    filePath: input.filePath,
    elements,
  };
}