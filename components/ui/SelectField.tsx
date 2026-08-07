"use client";

import { useId } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Shown as the neutral first entry, e.g. "Todas". */
  placeholder: string;
  disabled?: boolean;
  className?: string;
  /** Renders the label for screen readers only — used in dense toolbars. */
  hideLabel?: boolean;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  className,
  hideLabel,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className={cn(
          "plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "field h-11 cursor-pointer truncate pl-3 pr-9 text-[0.875rem]",
            value && "border-line-strong",
            disabled && "cursor-not-allowed opacity-45",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[1rem] text-fg-subtle"
        />
      </div>
    </div>
  );
}
