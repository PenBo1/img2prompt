import { ExternalLink, Image, Keyboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function App() {
  const handleOpenOptions = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className="w-80 p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="size-5 text-primary" />
            img2prompt
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Convert images to AI prompts with dual language support (EN & ZH)
          </p>

          <Separator />

          {/* Keyboard Shortcuts */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Keyboard className="size-4" />
              Shortcuts
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Select image</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Ctrl+Shift+I</kbd>
              </div>
              <div className="flex justify-between">
                <span>Take screenshot</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Ctrl+Shift+S</kbd>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button className="w-full justify-start" onClick={handleOpenOptions} variant="outline">
              <Settings className="size-4" />
              Settings
            </Button>
            <Button
              className="w-full justify-start"
              onClick={() => browser.tabs.create({ url: "https://github.com/PenBo1/img2prompt" })}
              variant="ghost"
            >
              <ExternalLink className="size-4" />
              GitHub Repository
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;