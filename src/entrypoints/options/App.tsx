"use client";

import {
  Check,
  Globe,
  Info,
  Keyboard,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useConfig } from "~/hooks";
import { testAPIConnection } from "~/lib/llm";
import type { APIConfig, LLMProvider, UserPreferences } from "~/types";
import { PROVIDER_DEFAULTS } from "~/types";

type ActiveSection = "api" | "preferences" | "shortcuts" | "about";

export default function App() {
  const { getConfig, updateAPIConfig, updatePreferences } = useConfig();
  const [activeSection, setActiveSection] = useState<ActiveSection>("api");

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

  const navItems = [
    {
      id: "api" as const,
      title: "API Configuration",
      icon: Sparkles,
    },
    {
      id: "preferences" as const,
      title: "Preferences",
      icon: SettingsIcon,
    },
    {
      id: "shortcuts" as const,
      title: "Keyboard Shortcuts",
      icon: Keyboard,
    },
    {
      id: "about" as const,
      title: "About",
      icon: Info,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex items-center gap-2">
                  <Globe className="size-6 text-primary" />
                  <span className="font-semibold text-lg">img2prompt</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-lg">
            {navItems.find((item) => item.id === activeSection)?.title}
          </h1>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {activeSection === "api" && (
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Provider</CardTitle>
                    <CardDescription>
                      Choose your LLM provider and configure API settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
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

                    {apiConfig.provider === "custom" && (
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="endpoint">API Endpoint</Label>
                        <Input
                          id="endpoint"
                          onChange={(e) =>
                            setAPIConfig({
                              ...apiConfig,
                              endpoint: e.target.value,
                            })
                          }
                          placeholder="https://api.example.com/v1"
                          type="url"
                          value={apiConfig.endpoint || ""}
                        />
                      </div>
                    )}

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

                    <div className="flex items-center gap-4">
                      <Button
                        disabled={isTesting || !apiConfig.apiKey}
                        onClick={handleTest}
                        variant="outline"
                      >
                        {isTesting && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
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
                            Connection failed. Please check your API key and try
                            again.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            )}

            {activeSection === "preferences" && (
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Language & UI</CardTitle>
                    <CardDescription>
                      Customize language and UI settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
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

                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Settings
                </Button>
              </div>
            )}

            {activeSection === "shortcuts" && (
              <Card>
                <CardHeader>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>
                    Quick actions for capturing images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Select image from page</span>
                      <kbd className="rounded bg-muted px-2 py-1 font-mono text-sm">
                        Ctrl+Shift+I
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">Take screenshot</span>
                      <kbd className="rounded bg-muted px-2 py-1 font-mono text-sm">
                        Ctrl+Shift+S
                      </kbd>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "about" && (
              <Card>
                <CardHeader>
                  <CardTitle>About img2prompt</CardTitle>
                  <CardDescription>
                    Browser extension for converting images to AI prompts
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Version</p>
                    <p className="text-muted-foreground text-sm">0.0.0</p>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Description</p>
                    <p className="text-muted-foreground text-sm">
                      Convert images to AI image generation prompts with dual
                      language support (EN & ZH). Supports multiple capture methods,
                      custom LLM providers, and keyboard shortcuts.
                    </p>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-sm">Features</p>
                    <ul className="list-inside list-disc text-muted-foreground text-sm">
                      <li>Dual language output (English & Chinese)</li>
                      <li>Multiple capture methods (selection, screenshot)</li>
                      <li>Custom LLM integration (OpenAI, Anthropic, Gemini)</li>
                      <li>Keyboard shortcuts for quick access</li>
                      <li>Embedded floating button in web pages</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Author</p>
                    <p className="text-muted-foreground text-sm">penbo</p>
                  </div>

                  <Separator />

                  <Button
                    onClick={() =>
                      browser.tabs.create({
                        url: "https://github.com/PenBo1/img2prompt",
                      })
                    }
                    variant="outline"
                  >
                    <Globe className="mr-2 size-4" />
                    View on GitHub
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}