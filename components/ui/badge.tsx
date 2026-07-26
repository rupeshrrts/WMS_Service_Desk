import * as React from "react";

export interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "purple";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-foreground text-background border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/85",
    outline: "text-foreground border-border",
    success: "bg-success/10 text-success border-success/20 dark:bg-success/15",
    warning: "bg-warning/15 text-warning border-warning/30 dark:bg-warning/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/15",
    info: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15",
    purple: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/15"
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className || ""}`}
      {...props}
    />
  );
}
