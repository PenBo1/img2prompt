/**
 * Floating button component - embedded in web pages
 */

import { Camera, Image, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingButtonProps {
  onClose: () => void;
  onImageSelect: () => void;
  onScreenshot: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function FloatingButton({
  onImageSelect,
  onScreenshot,
  onClose,
  position = "bottom-right",
}: FloatingButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6",
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        "fixed z-[2147483647] flex flex-col gap-2",
        positionClasses[position]
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded menu */}
      {isExpanded && (
        <div className="fade-in slide-in-from-bottom-2 flex animate-in flex-col gap-2">
          <Button
            aria-label="Select image from page"
            className="size-12 rounded-full shadow-lg"
            onClick={onImageSelect}
            size="icon"
            variant="default"
          >
            <Image data-icon="icon" />
          </Button>

          <Button
            aria-label="Take screenshot"
            className="size-12 rounded-full shadow-lg"
            onClick={onScreenshot}
            size="icon"
            variant="default"
          >
            <Camera data-icon="icon" />
          </Button>

          <Button
            aria-label="Close menu"
            className="size-12 rounded-full shadow-lg"
            onClick={onClose}
            size="icon"
            variant="secondary"
          >
            <X data-icon="icon" />
          </Button>
        </div>
      )}

      {/* Main button */}
      <Button
        aria-label="img2prompt - Capture image"
        className="size-14 rounded-full shadow-lg"
        size="icon"
        variant="default"
      >
        <Image className="size-6" data-icon="icon" />
      </Button>
    </div>
  );
}
