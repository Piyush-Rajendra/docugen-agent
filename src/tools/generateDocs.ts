import Anthropic from "@anthropic-ai/sdk";
import type { CodeElement } from "../types/index.ts";

export interface GenerateDocsInput {
  elements: CodeElement[];
  filePath: string;
}

export interface GenerateDocsOutput {
  documentation: string;
  filePath: string;
}

export async function generateDocs(
  input: GenerateDocsInput,
  apiKey: string
): Promise<GenerateDocsOutput> {
  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are a technical documentation expert. Generate clear, concise documentation for the following code elements from ${input.filePath}:

${JSON.stringify(input.elements, null, 2)}

Format the documentation as markdown with:
- A brief file overview
- Each function/class/interface documented with:
  - Purpose
  - Parameters (if any)
  - Return type
  - Usage example (if applicable)

Keep it professional and practical.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  const documentation = content.type === "text" ? content.text : "";

  return {
    documentation,
    filePath: input.filePath,
  };
}