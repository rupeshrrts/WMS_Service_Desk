"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

export interface AccordionProps extends React.ComponentProps<"div"> {
  type?: "single" | "multiple";
  collapsible?: boolean;
}

export function Accordion({
  type = "single",
  className,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        } else {
          return prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value];
        }
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`space-y-2 ${className || ""}`} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends React.ComponentProps<"div"> {
  value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <div
      className={`border border-border rounded-lg bg-card/50 overflow-hidden ${className || ""}`}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AccordionTriggerProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

export function AccordionTrigger({ children, className, ...props }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be used within Accordion");

  // Find the parent item value
  const itemRef = React.useRef<HTMLButtonElement>(null);
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    const parent = itemRef.current?.closest("[data-value]");
    if (parent) {
      setValue(parent.getAttribute("data-value") || "");
    }
  }, []);

  const isOpen = context.openItems.includes(value);

  return (
    <button
      ref={itemRef}
      type="button"
      className={`flex w-full items-center justify-between p-4 font-sans text-sm font-medium transition-all hover:bg-muted/40 cursor-pointer ${className || ""}`}
      onClick={() => context.toggleItem(value)}
      {...props}
    >
      {children}
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be used within Accordion");

  const itemRef = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    const parent = itemRef.current?.closest("[data-value]");
    if (parent) {
      setValue(parent.getAttribute("data-value") || "");
    }
  }, []);

  const isOpen = context.openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div
      ref={itemRef}
      className={`p-4 pt-0 text-sm text-muted-foreground bg-muted/10 border-t border-border/20 animate-fade-in ${className || ""}`}
      {...props}
    >
      <div className="pt-3">{children}</div>
    </div>
  );
}
