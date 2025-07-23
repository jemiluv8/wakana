import { ReactNode } from "react";
import styles from "./ChartsGrid.module.css";
import { cn } from "@/lib/utils";

export interface ChartsGridProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "top";
  withBorder?: boolean;
}

export function ChartsGrid({
  children,
  className,
  variant = "default",
  withBorder = false,
}: ChartsGridProps) {
  const gridClass = variant === "top" ? styles.chartsGridTop : styles.chartsGrid;

  return (
    <div
      className={cn(
        gridClass,
        {
          [styles.withBorder]: withBorder,
        },
        className
      )}
    >
      {children}
    </div>
  );
}