"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext);

  return (
    <span className="text-left">
      {value || <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
};

const SelectContent = ({ children }: SelectContentProps) => {
  const { open, setOpen } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
        <div className="p-1">{children}</div>
      </div>
    </>
  );
};

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext);

  const handleSelect = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
        className
      )}
    >
      {children}
    </button>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
