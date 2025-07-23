import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./ChartBox.module.css";

export interface ChartBoxProps {
  children: ReactNode;
  className?: string;
  noBorder?: boolean;
  padding?: "small" | "medium" | "large" | "extra-large";
  minHeight?: string;
  maxHeight?: string;
}

export function ChartBox({
  children,
  className,
  noBorder = false,
  padding = "small",
  minHeight,
  maxHeight,
}: ChartBoxProps) {
  const paddingClass = {
    small: styles.smallPadding,
    medium: styles.mediumPadding,
    large: styles.largePadding,
    "extra-large": styles.extraLargePadding,
  }[padding];

  return (
    <div
      className={cn(
        styles.chartBox,
        {
          [styles.noBorder]: noBorder,
        },
        paddingClass,
        className
      )}
      style={{
        ...(minHeight && { minHeight }),
        ...(maxHeight && { maxHeight }),
      }}
    >
      {children}
    </div>
  );
}
