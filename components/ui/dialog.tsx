"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Content wrapper */}
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg transition-all duration-300 dark:shadow-black/50 overflow-hidden max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col gap-1.5 text-center sm:text-left border-b border-border/40 pb-4 mb-4 ${className || ""}`}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={`text-sm text-muted-foreground ${className || ""}`}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-border/40 pt-4 mt-4 ${className || ""}`}
      {...props}
    />
  );
}
