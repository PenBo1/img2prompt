import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">About</h1>
        <p className="text-muted-foreground">
          Browser extension for converting images to AI prompts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About img2prompt</CardTitle>
          <CardDescription>
            Browser extension for converting images to AI prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel className="text-muted-foreground">Version</FieldLabel>
              <p className="text-sm font-medium">0.0.0</p>
            </Field>

            <Separator />

            <Field>
              <FieldLabel className="text-muted-foreground">Description</FieldLabel>
              <p className="text-sm leading-relaxed">
                Convert images to AI image generation prompts with dual
                language support (EN & ZH). Supports multiple capture methods,
                custom LLM providers, and keyboard shortcuts.
              </p>
            </Field>

            <Separator />

            <Field>
              <FieldLabel className="text-muted-foreground">Features</FieldLabel>
              <ul className="list-inside list-disc text-sm space-y-1">
                <li>Dual language output (English & Chinese)</li>
                <li>Multiple capture methods (selection, screenshot)</li>
                <li>Custom LLM integration (OpenAI, Anthropic, Gemini)</li>
                <li>Keyboard shortcuts for quick access</li>
                <li>Embedded floating button in web pages</li>
              </ul>
            </Field>

            <Separator />

            <Field>
              <FieldLabel className="text-muted-foreground">Author</FieldLabel>
              <p className="text-sm">penbo</p>
            </Field>

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
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}