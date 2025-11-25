# DocuGen Agent

AI-powered code documentation generator built with Zypher framework principles for autonomous tool orchestration.

## Overview

DocuGen Agent automatically scans codebases, extracts code elements, and generates comprehensive documentation using Claude AI. Supports both local directories and remote GitHub repositories with interactive file selection.

## Architecture

Built following Zypher's tool-based agent architecture with five custom tools:

- **scanDirectory**: Recursively scans local filesystem for code files
- **githubFetch**: Fetches repository structure and file contents via GitHub API
- **parseCode**: Extracts functions, classes, interfaces, types, and Express routes
- **generateDocs**: Leverages Claude AI for intelligent documentation generation
- **exportDocs**: Exports formatted markdown documentation
- **interactiveCLI**: Provides interactive file selection interface

The orchestrator autonomously coordinates these tools to accomplish documentation tasks.

## Features

- Local directory scanning with recursive traversal
- GitHub repository integration without cloning
- Interactive file selection for remote repositories
- Multi-language support (TypeScript, JavaScript, Python, Java, C++, Go)
- Express.js route detection and documentation
- Intelligent code parsing with multiple pattern matching
- AI-powered documentation generation
- Clean markdown export

## Prerequisites

- Deno 1.37 or higher
- Anthropic API key

## Installation
```bash
git clone https://github.com/Piyush-Rajendra/docugen-agent.git
cd docugen-agent
deno install
```

## Configuration

Set your Anthropic API key as an environment variable:
```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

Alternatively, pass it via command line flag (see Usage).

## Usage

### Local Directory

Document code in a local directory:
```bash
deno task start --target ./src --output ./docs
```

### GitHub Repository

Document any public GitHub repository:
```bash
deno task start --github https://github.com/username/repository --output ./docs
```

The agent will:
1. Fetch repository file structure
2. Display available code files with numeric indices
3. Prompt for file selection (comma-separated numbers or 'all')
4. Generate and export documentation for selected files

### Command Line Options
```bash
--target      Path to local directory (e.g., ./src)
--github      GitHub repository URL (e.g., https://github.com/user/repo)
--output      Output directory for documentation (default: ./docs)
--api-key     Anthropic API key (alternative to environment variable)
```

## Example
```bash
deno task start --github https://github.com/expressjs/express --output ./express-docs
```

Output:
```
DocuGen Agent - AI-Powered Documentation Generator
============================================================
Mode: GitHub Repository
URL: https://github.com/expressjs/express
Output: ./express-docs
============================================================

Step 1: Fetching repository structure...
[OK] Found 45 code files

Repository Files:

lib/
  [0] application.js (lib/application.js)
  [1] express.js (lib/express.js)
  [2] request.js (lib/request.js)
  [3] response.js (lib/response.js)
  ...

------------------------------------------------------------
Enter file numbers to document (comma-separated)
   Example: 0,2,5  OR  'all' for all files
------------------------------------------------------------
```

## Project Structure
```
docugen-agent/
├── src/
│   ├── agent/
│   │   └── orchestrator.ts      # Main agent orchestration logic
│   ├── tools/
│   │   ├── scanDirectory.ts     # Local filesystem scanning
│   │   ├── githubFetch.ts       # GitHub API integration
│   │   ├── interactiveCLI.ts    # User interaction interface
│   │   ├── parseCode.ts         # Code element extraction
│   │   ├── generateDocs.ts      # AI documentation generation
│   │   └── exportDocs.ts        # Markdown export functionality
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── main.ts                  # Application entry point
├── deno.json                     # Deno configuration and dependencies
└── README.md                     # Project documentation
```

## Technical Details

### Code Parsing

Supports multiple code patterns:
- Function declarations and expressions
- Arrow functions and async functions
- ES6 class definitions
- TypeScript interfaces and type aliases
- Express.js route definitions (router.get, app.post, etc.)
- CommonJS and ES modules

### GitHub Integration

- Uses GitHub REST API v3
- Automatically detects main/master branch
- Base64 content decoding
- Supports public repositories without authentication
- Rate limit aware (60 requests per hour for unauthenticated)

### AI Documentation

- Uses Claude Sonnet 4 model
- Context-aware documentation generation
- Includes parameter descriptions and usage examples
- Maintains consistent formatting

## Error Handling

The agent includes comprehensive error handling:
- GitHub API failures with fallback branch detection
- File parsing errors with graceful skipping
- Invalid user input validation
- Missing API key detection
- Network timeout handling

## Limitations

- Requires public GitHub repositories (no authentication support)
- GitHub API rate limit: 60 requests/hour (unauthenticated)
- Maximum file size: 1MB per file
- Supported languages: TypeScript, JavaScript, Python, Java, C++, Go

## Built With

- Deno - Modern JavaScript/TypeScript runtime
- Anthropic Claude API - AI-powered documentation generation
- GitHub REST API - Repository access
- Standard Deno libraries - File system and CLI utilities

## Development

The agent follows Zypher framework principles:
- Tool-based architecture for modularity
- Clear separation of concerns
- Autonomous orchestration logic
- Extensible tool system

## Author

Piyush Rajendra

Built for CoreSpeed technical assessment.

## License

MIT
