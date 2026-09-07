import { Check, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConfig } from "~/hooks"
import { testAPIConnection } from "~/lib/llm"
import type { APIConfig, LLMProvider } from "~/types"
import { PROVIDER_DEFAULTS } from "~/types"

export function ApiProvidersPage() {
  const { getConfig, updateAPIConfig } = useConfig()

  const [apiConfig, setAPIConfig] = useState<APIConfig>({
    apiKey: "",
    maxTokens: PROVIDER_DEFAULTS.openai.maxTokens,
    model: PROVIDER_DEFAULTS.openai.model,
    provider: "openai",
    temperature: PROVIDER_DEFAULTS.openai.temperature,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const config = await getConfig()
      setAPIConfig(config.apiConfig)
    } catch (error) {
      console.error("Failed to load config:", error)
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateAPIConfig(apiConfig)
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save config:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTest() {
    if (!apiConfig.apiKey) {
      toast.error("Please enter an API key first.")
      return
    }

    setIsTesting(true)
    setTestResult(null)
    try {
      const success = await testAPIConnection(apiConfig)
      if (success) {
        setTestResult("success")
        toast.success("Connection successful!")
      } else {
        setTestResult("error")
        toast.error("Connection failed")
      }
    } catch (error) {
      console.error("API test failed:", error)
      setTestResult("error")
      toast.error("Connection failed")
    } finally {
      setIsTesting(false)
    }
  }

  function handleProviderChange(provider: LLMProvider) {
    const defaults = PROVIDER_DEFAULTS[provider]
    setAPIConfig({
      ...apiConfig,
      maxTokens: defaults.maxTokens,
      model: defaults.model,
      provider,
      temperature: defaults.temperature,
    })
    setTestResult(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">API Configuration</h1>
        <p className="text-muted-foreground">
          Configure your AI provider and API settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Choose your LLM provider and configure API settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="provider">Provider</FieldLabel>
              <Select
                onValueChange={(value) => handleProviderChange(value as LLMProvider)}
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
              <FieldDescription>
                Select the AI provider for generating prompts
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="api-key">API Key</FieldLabel>
              <Input
                id="api-key"
                onChange={(e) => setAPIConfig({ ...apiConfig, apiKey: e.target.value })}
                placeholder="Enter your API key"
                type="password"
                value={apiConfig.apiKey}
              />
              <FieldDescription>
                Your API key is stored locally and never sent to our servers
              </FieldDescription>
            </Field>

            {apiConfig.provider === "custom" && (
              <Field>
                <FieldLabel htmlFor="endpoint">API Endpoint</FieldLabel>
                <Input
                  id="endpoint"
                  onChange={(e) => setAPIConfig({ ...apiConfig, endpoint: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  type="url"
                  value={apiConfig.endpoint || ""}
                />
                <FieldDescription>
                  Custom API endpoint URL
                </FieldDescription>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="model">Model</FieldLabel>
              <Input
                id="model"
                onChange={(e) => setAPIConfig({ ...apiConfig, model: e.target.value })}
                placeholder={PROVIDER_DEFAULTS[apiConfig.provider].model}
                type="text"
                value={apiConfig.model}
              />
              <FieldDescription>
                Model to use for prompt generation
              </FieldDescription>
            </Field>

            <div className="flex items-center gap-4 pt-2">
              <Button
                disabled={isTesting || !apiConfig.apiKey}
                onClick={handleTest}
                variant="outline"
              >
                {isTesting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Test Connection
              </Button>

              {testResult === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="size-4" />
                  <span>API key is valid</span>
                </div>
              )}

              {testResult === "error" && (
                <span className="text-sm text-destructive">
                  Connection failed
                </span>
              )}
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  )
}