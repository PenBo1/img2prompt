/**
 * Options page - configure API settings and preferences
 */

import {
  Check,
  Globe,
  Loader2,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "~/hooks";
import { testAPIConnection } from "~/lib/llm";
import type { APIConfig, LLMProvider, UserPreferences } from "~/types";
import { PROVIDER_DEFAULTS } from "~/types";

export default function App() {
  const { getConfig, updateAPIConfig, updatePreferences } = useConfig();
  const [apiConfig, setAPIConfig] = useState<APIConfig>({
    apiKey: "",
    maxTokens: PROVIDER_DEFAULTS.openai.maxTokens,
    model: PROVIDER_DEFAULTS.openai.model,
    provider: "openai",
    temperature: PROVIDER_DEFAULTS.openai.temperature,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    floatingButtonPosition: "bottom-right",
    language: "auto",
    outputLanguage: "both",
    showFloatingButton: true,
    theme: "auto",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null
  );

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const config = await getConfig();
      setAPIConfig(config.apiConfig);
      setPreferences(config.preferences);
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateAPIConfig(apiConfig);
      await updatePreferences(preferences);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    if (!apiConfig.apiKey) {
      alert("Please enter an API key first.");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const success = await testAPIConnection(apiConfig);
      setTestResult(success ? "success" : "error");
    } catch (error) {
      console.error("API test failed:", error);
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  }

  function handleProviderChange(provider: LLMProvider) {
    const defaults = PROVIDER_DEFAULTS[provider];
    setAPIConfig({
      ...apiConfig,
      maxTokens: defaults.maxTokens,
      model: defaults.model,
      provider,
      temperature: defaults.temperature,
    });
    setTestResult(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-bold text-3xl">
          <SettingsIcon className="size-8" />
          img2prompt Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure your AI providers and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              AI Provider
            </CardTitle>
            <CardDescription>
              Choose your LLM provider and configure API settings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Provider selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                onValueChange={(value) =>
                  handleProviderChange(value as LLMProvider)
                }
                value={apiConfig.provider}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="custom">Custom Endpoint</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                onChange={(e) =>
                  setAPIConfig({ ...apiConfig, apiKey: e.target.value })
                }
                placeholder="Enter your API key"
                type="password"
                value={apiConfig.apiKey}
              />
            </div>

            {/* Custom endpoint (for custom provider) */}
            {apiConfig.provider === "custom" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  onChange={(e) =>
                    setAPIConfig({ ...apiConfig, endpoint: e.target.value })
                  }
                  placeholder="https://api.example.com/v1"
                  type="url"
                  value={apiConfig.endpoint || ""}
                />
              </div>
            )}

            {/* Model */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                onChange={(e) =>
                  setAPIConfig({ ...apiConfig, model: e.target.value })
                }
                placeholder={PROVIDER_DEFAULTS[apiConfig.provider].model}
                type="text"
                value={apiConfig.model}
              />
            </div>

            {/* Test connection */}
            <div className="flex items-center gap-4">
              <Button
                disabled={isTesting || !apiConfig.apiKey}
                onClick={handleTest}
                variant="outline"
              >
                {isTesting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Test Connection
              </Button>

              {testResult === "success" && (
                <Alert className="flex-1">
                  <Check className="size-4" />
                  <AlertDescription>
                    Connection successful! API key is valid.
                  </AlertDescription>
                </Alert>
              )}

              {testResult === "error" && (
                <Alert className="flex-1" variant="destructive">
                  <AlertDescription>
                    Connection failed. Please check your API key and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize language and UI settings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Output language */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="output-language">Prompt Output Language</Label>
              <Select
                onValueChange={(value) =>
                  setPreferences({
                    ...preferences,
                    outputLanguage: value as "en" | "zh" | "both",
                  })
                }
                value={preferences.outputLanguage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="both">English + Chinese</SelectItem>
                    <SelectItem value="en">English Only</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Floating button position */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="button-position">Floating Button Position</Label>
              <Select
                onValueChange={(value) =>
                  setPreferences({
                    ...preferences,
                    floatingButtonPosition:
                      value as UserPreferences["floatingButtonPosition"],
                  })
                }
                value={preferences.floatingButtonPosition}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button disabled={isSaving} onClick={handleSave} size="lg">
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Settings
        </Button>

        {/* Keyboard shortcuts info */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Quick actions for capturing images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Select image from page</span>
                <kbd className="rounded bg-muted px-2 py-1 text-sm">
                  Ctrl+Shift+I
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Take screenshot</span>
                <kbd className="rounded bg-muted px-2 py-1 text-sm">
                  Ctrl+Shift+S
                </kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
