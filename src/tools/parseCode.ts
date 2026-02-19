import type { CodeElement } from "../types/index.ts";
import { extname } from "@std/path";

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
  const ext = extname(input.filePath).toLowerCase();
  const elements: CodeElement[] = [];

  switch (ext) {
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
      parseJavaScript(content, elements);
      break;
    case ".py":
      parsePython(content, elements);
      break;
    case ".java":
      parseJava(content, elements);
      break;
    case ".go":
      parseGo(content, elements);
      break;
    case ".c":
    case ".cpp":
      parseCCpp(content, elements);
      break;
    default:
      // Fall back to JS/TS patterns for unknown extensions
      parseJavaScript(content, elements);
  }

  return {
    filePath: input.filePath,
    elements,
  };
}

function getLine(content: string, index: number): number {
  return content.substring(0, index).split("\n").length;
}

// ──────────────────────────────────────────────
// JavaScript / TypeScript
// ──────────────────────────────────────────────
function parseJavaScript(content: string, elements: CodeElement[]): void {
  let match;
  const foundNames = new Set<string>();

  const functionPatterns = [
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g, // function name()
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/g, // const name = function
    /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g, // const name = () =>
    /(?:export\s+)?let\s+(\w+)\s*=\s*(?:async\s+)?function/g, // let name = function
    /(?:export\s+)?let\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g, // let name = () =>
    /(\w+)\s*:\s*(?:async\s+)?function/g, // name: function (object methods)
    /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>/g, // name: () => (object methods)
  ];

  for (const pattern of functionPatterns) {
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      if (!foundNames.has(name) && name !== "require" && name !== "exports") {
        foundNames.add(name);
        elements.push({ name, type: "function", line: getLine(content, match.index) });
      }
    }
  }

  // Express routes (router.get, router.post, etc.)
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = routeRegex.exec(content)) !== null) {
    elements.push({
      name: `${match[1].toUpperCase()} ${match[2]}`,
      type: "route",
      line: getLine(content, match.index),
    });
  }

  // App routes (app.get, app.post, etc.)
  const appRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = appRouteRegex.exec(content)) !== null) {
    elements.push({
      name: `${match[1].toUpperCase()} ${match[2]}`,
      type: "route",
      line: getLine(content, match.index),
    });
  }

  // Classes
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "class", line: getLine(content, match.index) });
  }

  // Interfaces (TypeScript)
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "interface", line: getLine(content, match.index) });
  }

  // Types (TypeScript)
  const typeRegex = /(?:export\s+)?type\s+(\w+)/g;
  while ((match = typeRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "type", line: getLine(content, match.index) });
  }

  // Fallback: capture module.exports
  if (elements.length === 0) {
    const exportsRegex = /module\.exports\s*=\s*(\w+)/g;
    while ((match = exportsRegex.exec(content)) !== null) {
      elements.push({ name: match[1], type: "export", line: getLine(content, match.index) });
    }
  }
}

// ──────────────────────────────────────────────
// Python
// ──────────────────────────────────────────────
function parsePython(content: string, elements: CodeElement[]): void {
  let match;

  // Function definitions: def function_name(
  const funcRegex = /^[ \t]*(?:async\s+)?def\s+(\w+)\s*\(/gm;
  while ((match = funcRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "function", line: getLine(content, match.index) });
  }

  // Class definitions: class ClassName:  or  class ClassName(Base):
  const classRegex = /^[ \t]*class\s+(\w+)\s*[:(]/gm;
  while ((match = classRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "class", line: getLine(content, match.index) });
  }
}

// ──────────────────────────────────────────────
// Java
// ──────────────────────────────────────────────
function parseJava(content: string, elements: CodeElement[]): void {
  let match;

  // Class declarations
  const classRegex =
    /(?:public|private|protected|abstract|final|\s)+class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "class", line: getLine(content, match.index) });
  }

  // Interface declarations
  const interfaceRegex =
    /(?:public|private|protected|\s)+interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "interface", line: getLine(content, match.index) });
  }

  // Method declarations: [modifiers] [returnType] methodName(
  // Matches lines like: public void doSomething(, private static int compute(
  const methodRegex =
    /(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:[\w<>\[\]]+\s+)+(\w+)\s*\(/g;
  const foundMethods = new Set<string>();
  while ((match = methodRegex.exec(content)) !== null) {
    const name = match[1];
    // Skip class/interface names and Java keywords
    if (!foundMethods.has(name) && !/^(class|interface|enum|if|for|while|switch|catch)$/.test(name)) {
      foundMethods.add(name);
      elements.push({ name, type: "function", line: getLine(content, match.index) });
    }
  }
}

// ──────────────────────────────────────────────
// Go
// ──────────────────────────────────────────────
function parseGo(content: string, elements: CodeElement[]): void {
  let match;

  // Function declarations: func FuncName( or func (receiver) FuncName(
  const funcRegex = /^func\s+(?:\(\s*\w+\s+\*?\w+\s*\)\s+)?(\w+)\s*\(/gm;
  while ((match = funcRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "function", line: getLine(content, match.index) });
  }

  // Type declarations: type Name struct  or  type Name interface
  const typeStructRegex = /^type\s+(\w+)\s+struct/gm;
  while ((match = typeStructRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "class", line: getLine(content, match.index) });
  }

  const typeInterfaceRegex = /^type\s+(\w+)\s+interface/gm;
  while ((match = typeInterfaceRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "interface", line: getLine(content, match.index) });
  }

  // Other type aliases: type Name SomeType
  const typeAliasRegex = /^type\s+(\w+)\s+(?!struct|interface)\w/gm;
  while ((match = typeAliasRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "type", line: getLine(content, match.index) });
  }
}

// ──────────────────────────────────────────────
// C / C++
// ──────────────────────────────────────────────
function parseCCpp(content: string, elements: CodeElement[]): void {
  let match;

  // Class declarations (C++)
  const classRegex = /^[ \t]*class\s+(\w+)/gm;
  while ((match = classRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "class", line: getLine(content, match.index) });
  }

  // Struct declarations
  const structRegex = /^[ \t]*(?:typedef\s+)?struct\s+(\w+)/gm;
  while ((match = structRegex.exec(content)) !== null) {
    elements.push({ name: match[1], type: "type", line: getLine(content, match.index) });
  }

  // Function definitions: returnType functionName(
  // Must start at beginning of line (not indented), have a word before the name
  const funcRegex = /^(?![ \t])(?:[\w:*&<>]+\s+)+(\w+)\s*\([^;]*\)\s*(?:const\s*)?\{/gm;
  const foundFuncs = new Set<string>();
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1];
    if (
      !foundFuncs.has(name) &&
      !/^(if|for|while|switch|do|return|class|struct|namespace)$/.test(name)
    ) {
      foundFuncs.add(name);
      elements.push({ name, type: "function", line: getLine(content, match.index) });
    }
  }
}
