/**
 * LLM API service for generating prompts
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { APIConfig } from "~/types";

// System prompt for image analysis
const SYSTEM_PROMPT = `You are an expert at analyzing images and creating detailed prompts for AI image generation.

Your task is to analyze the provided image and create a detailed prompt that could be used to generate a similar image with an AI image generator.

Guidelines:
1. Describe the main subject(s) clearly
2. Include style, composition, and mood
3. Specify lighting and color palette
4. Note any distinctive features or details
5. Keep prompts concise but descriptive (2-4 sentences)

If you need to respond in a specific language, the user will specify it.`;

/**
 * Create LLM client based on provider
 */
function createLLMClient(config: APIConfig) {
  switch (config.provider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey: config.apiKey,
      });
      return openai(config.model || "gpt-4o");
    }

    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
      });
      return anthropic(config.model || "claude-sonnet-4-20250514");
    }

    case "gemini": {
      const google = createGoogleGenerativeAI({
        apiKey: config.apiKey,
      });
      return google(config.model || "gemini-1.5-flash");
    }

    case "custom": {
      // Custom provider - use OpenAI-compatible API
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint,
      });
      return openai(config.model || "default");
    }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

/**
 * Generate prompt for an image
 */
export async function generatePrompt(
  imageData: string,
  config: APIConfig,
  language: "en" | "zh" | "both" = "both"
): Promise<{ englishPrompt: string; chinesePrompt: string }> {
  try {
    const model = createLLMClient(config);

    // Generate prompts based on language preference
    if (language === "en") {
      const result = await generateText({
        messages: [
          {
            content: SYSTEM_PROMPT,
            role: "system",
          },
          {
            content: [
              {
                image: imageData,
                type: "image",
              },
              {
                text: "Generate a detailed prompt for this image in English.",
                type: "text",
              },
            ],
            role: "user",
          },
        ],
        model,
        temperature: config.temperature ?? 0.7,
      });

      return {
        chinesePrompt: "",
        englishPrompt: result.text,
      };
    }

    if (language === "zh") {
      const result = await generateText({
        messages: [
          {
            content: SYSTEM_PROMPT,
            role: "system",
          },
          {
            content: [
              {
                image: imageData,
                type: "image",
              },
              {
                text: "为这张图片生成一个详细的中文提示词。",
                type: "text",
              },
            ],
            role: "user",
          },
        ],
        model,
        temperature: config.temperature ?? 0.7,
      });

      return {
        chinesePrompt: result.text,
        englishPrompt: "",
      };
    }

    // Generate both languages
    const [enResult, zhResult] = await Promise.all([
      generateText({
        messages: [
          {
            content: SYSTEM_PROMPT,
            role: "system",
          },
          {
            content: [
              {
                image: imageData,
                type: "image",
              },
              {
                text: "Generate a detailed prompt for this image in English.",
                type: "text",
              },
            ],
            role: "user",
          },
        ],
        model,
        temperature: config.temperature ?? 0.7,
      }),
      generateText({
        messages: [
          {
            content: SYSTEM_PROMPT,
            role: "system",
          },
          {
            content: [
              {
                image: imageData,
                type: "image",
              },
              {
                text: "为这张图片生成一个详细的中文提示词。",
                type: "text",
              },
            ],
            role: "user",
          },
        ],
        model,
        temperature: config.temperature ?? 0.7,
      }),
    ]);

    return {
      chinesePrompt: zhResult.text,
      englishPrompt: enResult.text,
    };
  } catch (error) {
    console.error("Failed to generate prompt:", error);
    throw error;
  }
}

/**
 * Test API connection
 */
export async function testAPIConnection(config: APIConfig): Promise<boolean> {
  try {
    const model = createLLMClient(config);

    await generateText({
      model,
      prompt: 'Hello, respond with "OK" if you can read this.',
    });

    return true;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
}
