import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Field Group - Container for multiple fields
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("flex flex-col gap-4", className)}
    ref={ref}
    {...props}
  />
));
FieldGroup.displayName = "FieldGroup";

// Field - Individual field wrapper
const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal";
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    className={cn(
      "flex",
      orientation === "vertical" ? "flex-col gap-2" : "flex-row items-center gap-4",
      className
    )}
    ref={ref}
    {...props}
  />
));
Field.displayName = "Field";

// Field Label
const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    className={cn("text-sm font-medium", className)}
    ref={ref}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

// Field Description
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

// Field Error
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-sm text-destructive", className)}
    ref={ref}
    {...props}
  />
));
FieldError.displayName = "FieldError";

export { FieldGroup, Field, FieldLabel, FieldDescription, FieldError };