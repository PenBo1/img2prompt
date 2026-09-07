import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"

export function ShortcutsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">Keyboard Shortcuts</h1>
        <p className="text-muted-foreground">
          Quick actions for capturing images
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
          <CardDescription>
            Quick actions for capturing images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <div className="flex flex-1 items-center justify-between rounded-lg border p-4">
                <span className="text-sm font-medium">Select image from page</span>
                <kbd className="rounded bg-muted px-3 py-1.5 font-mono text-sm">
                  Ctrl+Shift+I
                </kbd>
              </div>
            </Field>

            <Field orientation="horizontal">
              <div className="flex flex-1 items-center justify-between rounded-lg border p-4">
                <span className="text-sm font-medium">Take screenshot</span>
                <kbd className="rounded bg-muted px-3 py-1.5 font-mono text-sm">
                  Ctrl+Shift+S
                </kbd>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}