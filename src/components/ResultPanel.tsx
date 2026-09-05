/**
 * Result panel component - displays generated prompts
 */

import { Check, Copy, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ResultPanelProps {
  chinesePrompt: string;
  englishPrompt: string;
  isLoading?: boolean;
  onClose: () => void;
}

export function ResultPanel({
  englishPrompt,
  chinesePrompt,
  isLoading = false,
  onClose,
}: ResultPanelProps) {
  const [copiedEN, setCopiedEN] = useState(false);
  const [copiedZH, setCopiedZH] = useState(false);

  const handleCopy = async (text: string, lang: "en" | "zh") => {
    try {
      await navigator.clipboard.writeText(text);
      if (lang === "en") {
        setCopiedEN(true);
        setTimeout(() => setCopiedEN(false), 2000);
      } else {
        setCopiedZH(true);
        setTimeout(() => setCopiedZH(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/50">
      <Card className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Generated Prompts</CardTitle>
          <Button
            aria-label="Close panel"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X data-icon="icon" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating prompts...</p>
            </div>
          ) : (
            <>
              {/* English prompt */}
              {englishPrompt && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">English</Badge>
                    <Button
                      aria-label="Copy English prompt"
                      onClick={() => handleCopy(englishPrompt, "en")}
                      size="sm"
                      variant="ghost"
                    >
                      {copiedEN ? (
                        <Check className="text-green-500" data-icon="icon" />
                      ) : (
                        <Copy data-icon="icon" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-[100px]"
                    readOnly
                    value={englishPrompt}
                  />
                </div>
              )}

              {/* Chinese prompt */}
              {chinesePrompt && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">中文</Badge>
                    <Button
                      aria-label="Copy Chinese prompt"
                      onClick={() => handleCopy(chinesePrompt, "zh")}
                      size="sm"
                      variant="ghost"
                    >
                      {copiedZH ? (
                        <Check className="text-green-500" data-icon="icon" />
                      ) : (
                        <Copy data-icon="icon" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    className="min-h-[100px]"
                    readOnly
                    value={chinesePrompt}
                  />
                </div>
              )}

              {/* Close button */}
              <Button className="w-full" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
