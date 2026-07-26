import * as React from "react";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md ${className || ""}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={`flex flex-col gap-1.5 p-6 ${className || ""}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={`font-sans text-xl font-semibold leading-none tracking-tight ${className || ""}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={`font-sans text-sm text-muted-foreground ${className || ""}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={`p-6 pt-0 ${className || ""}`}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center p-6 pt-0 border-t border-border/40 mt-4 ${className || ""}`}
      {...props}
    />
  );
}
