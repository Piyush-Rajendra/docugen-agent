/**
 * Parsed code element extracted from a source file
 */
export interface CodeElement {
  type: "function" | "class" | "interface" | "type" | "route" | "export";
  name: string;
  line: number;
  startLine?: number;
  endLine?: number;
  code?: string;
  params?: string[];
  returnType?: string;
}

/**
 * Tool execution context
 */
export interface ToolContext {
  workingDirectory: string;
  apiKey: string;
}

/**
 * Result from tool execution
 */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * File scan result
 */
export interface FileInfo {
  path: string;
  relativePath: string;
  extension: string;
  size: number;
}

/**
 * Documentation output
 */
export interface Documentation {
  fileName: string;
  filePath: string;
  summary: string;
  elements: Array<{
    name: string;
    type: string;
    description: string;
    parameters?: string;
    returns?: string;
    example?: string;
  }>;
}

/**
 * Git repository info
 */
export interface RepoInfo {
  url: string;
  name: string;
  localPath: string;
}
