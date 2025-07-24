import * as React from "react";
import { cn } from "@/lib/utils";

export interface SimpleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const SimpleInput = React.forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ className, type, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="relative w-full">
        {/* Input field */}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-lg border-2 bg-background px-4 transition-all duration-200 ease-in-out",
            "text-base sm:text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:ring-0",
            // Focus outline offset
            "focus:outline-2 focus:outline-primary focus:outline-offset-2",
            // Height - touch-friendly on mobile
            "h-14 sm:h-12 py-3",
            // Border states
            error 
              ? "border-destructive focus:border-destructive" 
              : isFocused 
                ? "border-primary shadow-sm" 
                : "border-border hover:border-border/80",
            // Dark mode support
            "dark:bg-background dark:border-border dark:text-foreground",
            "dark:hover:border-border/60 dark:focus:border-primary",
            "dark:placeholder:text-muted-foreground",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
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

SimpleInput.displayName = "SimpleInput";

export { SimpleInput };