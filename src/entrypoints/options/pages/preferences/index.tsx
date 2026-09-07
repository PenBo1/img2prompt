import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useConfig } from "~/hooks"
import type { UserPreferences } from "~/types"

export function PreferencesPage() {
  const { getConfig, updatePreferences } = useConfig()

  const [preferences, setPreferences] = useState<UserPreferences>({
    floatingButtonPosition: "bottom-right",
    language: "auto",
    outputLanguage: "both",
    showFloatingButton: true,
    theme: "auto",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const config = await getConfig()
      setPreferences(config.preferences)
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
      await updatePreferences(preferences)
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save config:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
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
        <h1 className="font-semibold text-2xl">Preferences</h1>
        <p className="text-muted-foreground">
          Customize language and UI settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language & UI</CardTitle>
          <CardDescription>
            Customize language and UI settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Prompt Output Language</FieldLabel>
              <ToggleGroup
                type="single"
                value={preferences.outputLanguage}
                onValueChange={(value) =>
                  value && setPreferences({
                    ...preferences,
                    outputLanguage: value as "en" | "zh" | "both",
                  })
                }
              >
                <ToggleGroupItem value="both">
                  English + Chinese
                </ToggleGroupItem>
                <ToggleGroupItem value="en">
                  English Only
                </ToggleGroupItem>
                <ToggleGroupItem value="zh">
                  中文
                </ToggleGroupItem>
              </ToggleGroup>
              <FieldDescription>
                Choose the output language for generated prompts
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="button-position">
                Floating Button Position
              </FieldLabel>
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
              <FieldDescription>
                Position of the floating button on web pages
              </FieldDescription>
            </Field>
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