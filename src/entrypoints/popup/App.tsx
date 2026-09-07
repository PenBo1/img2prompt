import { Globe, Keyboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function App() {
  const handleOpenOptions = () => {
    browser.runtime.openOptionsPage()
  }

  return (
    <>
      <div className="flex flex-col gap-4 bg-background px-6 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <span className="font-semibold text-lg">img2prompt</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          Convert images to AI prompts with dual language support (EN & ZH)
        </p>

        <Separator />

        {/* Keyboard shortcuts */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Keyboard className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Keyboard Shortcuts</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Select image</span>
              <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                Ctrl+Shift+I
              </kbd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Take screenshot</span>
              <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                Ctrl+Shift+S
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-neutral-200 px-2 py-1 dark:bg-neutral-800">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-700"
          onClick={handleOpenOptions}
        >
          <Settings className="size-4" strokeWidth={1.6} />
          <span className="text-[13px] font-medium">Settings</span>
        </button>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">v0.0.0</span>
      </div>
    </>
  )
}

export default App