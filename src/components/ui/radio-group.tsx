"use client";

import { createContext, useContext, useState } from "react";

interface RadioGroupContextType {
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className = "" }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={`flex flex-wrap gap-2 ${className}`}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroupItem({ value, children, className = "" }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error("RadioGroupItem must be used within RadioGroup");

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onChange(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isSelected
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80"
      } ${className}`}
    >
      {children}
    </button>
  );
}
