import * as React from "react";
import { cn } from "@/lib/utils";

export interface ClaudeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const ClaudeInput = React.forwardRef<HTMLInputElement, ClaudeInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    return (
      <div className="relative w-full">
        {/* Floating label */}
        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 ease-in-out pointer-events-none",
              "text-muted-foreground",
              (isFocused || hasValue) 
                ? "top-2 text-xs font-medium text-primary" 
                : "top-1/2 -translate-y-1/2 text-sm"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Input field */}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-lg border-2 bg-background px-4 transition-all duration-200 ease-in-out",
            "text-base sm:text-sm text-foreground placeholder:text-transparent",
            "focus:outline-none focus:ring-0",
            // Height and padding adjustments for floating label - larger on mobile
            label ? "h-16 sm:h-14 pt-7 sm:pt-6 pb-2" : "h-14 sm:h-12 py-3",
            // Border states
            error 
              ? "border-destructive focus:border-destructive" 
              : isFocused 
                ? "border-primary shadow-sm" 
                : "border-border hover:border-border/80",
            // Dark mode support
            "dark:bg-background dark:border-border dark:text-foreground",
            "dark:hover:border-border/60 dark:focus:border-primary",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
        
        {/* Error message */}
        {error && (
          <p className="mt-2 text-xs text-destructive font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ClaudeInput.displayName = "ClaudeInput";

export { ClaudeInput };