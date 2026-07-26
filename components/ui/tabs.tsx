"use client";

import * as React from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.ComponentProps<"div"> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [localValue, setLocalValue] = React.useState(defaultValue || "");
  const activeValue = value !== undefined ? value : localValue;
  
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (value === undefined) {
        setLocalValue(newValue);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className || ""}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground border border-border/40 ${className || ""}`}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  
  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "hover:bg-card/40 hover:text-foreground/80"
      } ${className || ""}`}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.ComponentProps<"div"> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");
  
  const isActive = context.value === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}
