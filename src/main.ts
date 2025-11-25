import { parseArgs } from "@std/cli/parse-args";
import { runDocGenAgent } from "./agent/orchestrator.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    string: ["target", "github", "output", "api-key"],
    default: {
      output: "./docs",
    },
  });

  // Get API key from args or environment
  const apiKey = args["api-key"] || Deno.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) {
    console.error("  Error: ANTHROPIC_API_KEY not found!");
    console.error("Set it via:");
    console.error("  - Environment variable: export ANTHROPIC_API_KEY=your-key");
    console.error("  - Command line flag: --api-key=your-key");
    Deno.exit(1);
  }

  // Validate input
  if (!args.target && !args.github) {
    console.error(" Error: Must specify either --target or --github");
    console.error("\nUsage:");
    console.error("  Local:  deno task start --target ./src --output ./docs");
    console.error("  GitHub: deno task start --github https://github.com/user/repo --output ./docs");
    Deno.exit(1);
  }

  if (args.target && args.github) {
    console.error("  Error: Cannot use both --target and --github");
    Deno.exit(1);
  }

  await runDocGenAgent({
    targetDir: args.target,
    githubUrl: args.github,
    outputDir: args.output,
    apiKey,
  });
}

if (import.meta.main) {
  main();
}