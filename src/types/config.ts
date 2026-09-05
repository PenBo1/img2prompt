/**
 * Configuration types for img2prompt extension
 */

// Supported LLM providers
export type LLMProvider = "openai" | "anthropic" | "gemini" | "custom";

// API configuration for a provider
export interface APIConfig {
  apiKey: string;
  endpoint?: string; // For custom providers
  maxTokens?: number;
  model?: string;
  provider: LLMProvider;
  temperature?: number;
}

// Provider-specific defaults
export const PROVIDER_DEFAULTS = {
  anthropic: {
    maxTokens: 1000,
    model: "claude-sonnet-4-20250514",
    temperature: 0.7,
  },
  custom: {
    maxTokens: 1000,
    model: "",
    temperature: 0.7,
  },
  gemini: {
    maxTokens: 1000,
    model: "gemini-1.5-flash",
    temperature: 0.7,
  },
  openai: {
    maxTokens: 1000,
    model: "gpt-4o",
    temperature: 0.7,
  },
} as const;

// User preferences
export interface UserPreferences {
  floatingButtonPosition:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left";
  language: "en" | "zh" | "auto"; // UI language
  outputLanguage: "en" | "zh" | "both"; // Prompt output language
  showFloatingButton: boolean;
  theme: "light" | "dark" | "auto";
}

// Extension configuration
export interface ExtensionConfig {
  apiConfig: APIConfig;
  preferences: UserPreferences;
  version: string;
}

// Default configuration
export const DEFAULT_CONFIG: ExtensionConfig = {
  apiConfig: {
    apiKey: "",
    maxTokens: PROVIDER_DEFAULTS.openai.maxTokens,
    model: PROVIDER_DEFAULTS.openai.model,
    provider: "openai",
    temperature: PROVIDER_DEFAULTS.openai.temperature,
  },
  preferences: {
    floatingButtonPosition: "bottom-right",
    language: "auto",
    outputLanguage: "both",
    showFloatingButton: true,
    theme: "auto",
  },
  version: "1.0.0",
};

// Storage keys
export const STORAGE_KEYS = {
  CONFIG: "config",
  HISTORY: "history",
  LAST_USED: "lastUsed",
} as const;
