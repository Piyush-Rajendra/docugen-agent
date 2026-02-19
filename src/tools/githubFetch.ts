export interface GitHubFileNode {
  path: string;
  type: "file" | "dir";
  url?: string;
  children?: GitHubFileNode[];
}

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree" | string;
  url: string;
  sha: string;
  size?: number;
  mode?: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
  sha: string;
  url: string;
  truncated: boolean;
}

interface GitHubContentResponse {
  content: string;
  encoding: string;
  path: string;
  name: string;
  sha: string;
  size: number;
  url: string;
}

export interface FetchRepoTreeInput {
  owner: string;
  repo: string;
  branch?: string;
}

export interface FetchRepoTreeOutput {
  tree: GitHubFileNode[];
  success: boolean;
}

export interface FetchFileContentInput {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
}

export interface FetchFileContentOutput {
  content: string;
  path: string;
  success: boolean;
}

// Parse GitHub URL to extract owner and repo
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

// Fetch repository tree structure
export async function fetchRepoTree(
  input: FetchRepoTreeInput
): Promise<FetchRepoTreeOutput> {
  const branch = input.branch || "main";
  
  try {
    // Try main first
    let apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/git/trees/${branch}?recursive=1`;
    let response = await fetch(apiUrl);
    
    // If main fails, try master
    if (!response.ok && branch === "main") {
      apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/git/trees/master?recursive=1`;
      response = await fetch(apiUrl);
    }
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      console.error(`Make sure the repository is public and exists`);
      return { tree: [], success: false };
    }

    const data: GitHubTreeResponse = await response.json();
    const codeExtensions = [".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".cpp", ".c", ".go"];

    // Filter only code files and build tree structure
    const tree: GitHubFileNode[] = data.tree
      .filter((item: GitHubTreeItem) => {
        if (item.type === "tree") return false;
        return codeExtensions.some(ext => item.path.endsWith(ext));
      })
      .map((item: GitHubTreeItem) => ({
        path: item.path,
        type: item.type === "blob" ? "file" as const : "dir" as const,
        url: item.url,
      }));

    return { tree, success: true };
  } catch (error) {
    console.error(`Error fetching repo tree: ${error}`);
    return { tree: [], success: false };
  }
}
// Fetch content of a specific file
export async function fetchFileContent(
  input: FetchFileContentInput
): Promise<FetchFileContentOutput> {
  const branch = input.branch || "main";
  
  try {
    // Try main first
    let apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}?ref=${branch}`;
    let response = await fetch(apiUrl);
    
    // If main fails, try master
    if (!response.ok && branch === "main") {
      apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}?ref=master`;
      response = await fetch(apiUrl);
    }
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return { content: "", path: input.path, success: false };
    }

    const data: GitHubContentResponse = await response.json();

    // GitHub returns base64 encoded content
    const content = atob(data.content.replace(/\n/g, ""));

    return { content, path: input.path, success: true };
  } catch (error) {
    console.error(`Error fetching file content: ${error}`);
    return { content: "", path: input.path, success: false };
  }
}