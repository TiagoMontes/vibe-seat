"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <div
      className={cn(
        "grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  );
};

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
  return <p className={cn("text-sm text-gray-500", className)}>{children}</p>;
};

const DialogClose = ({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) => {
  return (
    <button
      onClick={onClose}
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2",
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
};
