export interface GitHubFileNode {
  path: string;
  type: "file" | "dir";
  url?: string;
  children?: GitHubFileNode[];
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
  const apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/git/trees/${branch}?recursive=1`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return { tree: [], success: false };
    }

    const data = await response.json();
    const codeExtensions = [".ts", ".js", ".tsx", ".jsx", ".py", ".java", ".cpp", ".c", ".go"];
    
    // Filter only code files and build tree structure
    const tree: GitHubFileNode[] = data.tree
      .filter((item: any) => {
        if (item.type === "tree") return false;
        return codeExtensions.some(ext => item.path.endsWith(ext));
      })
      .map((item: any) => ({
        path: item.path,
        type: item.type === "blob" ? "file" : "dir",
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
  const apiUrl = `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${input.path}?ref=${branch}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return { content: "", path: input.path, success: false };
    }

    const data = await response.json();
    
    // GitHub returns base64 encoded content
    const content = atob(data.content);

    return { content, path: input.path, success: true };
  } catch (error) {
    console.error(`Error fetching file content: ${error}`);
    return { content: "", path: input.path, success: false };
  }
}