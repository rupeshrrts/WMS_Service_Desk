import * as React from "react";

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted-foreground/10 ${className || ""}`}
      {...props}
    />
  );
}
