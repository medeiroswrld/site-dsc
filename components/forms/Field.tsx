"use client";

import { useId } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/* Shape and states come from the `.field` primitive in globals.css; the
   invalid state is driven by aria-invalid, which is already on the element. */
const controlBase = "field px-3.5 text-[0.9375rem]";

interface BaseFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "tel" | "email" | "number";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal";
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, "h-12")}
      />
      <FieldFooter id={id} error={error} hint={hint} />
    </div>
  );
}

interface TextAreaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className,
  placeholder,
  rows = 4,
}: TextAreaFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlBase, "resize-y py-3")}
      />
      <FieldFooter id={id} error={error} hint={hint} />
    </div>
  );
}

interface SelectFieldFormProps extends BaseFieldProps {
  options: string[];
  placeholder: string;
}

export function FormSelectField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  className,
  options,
  placeholder,
}: SelectFieldFormProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            "h-12 cursor-pointer pr-10",
            !value && "text-fg-subtle",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[1rem] text-fg-subtle"
        />
      </div>
      <FieldFooter id={id} error={error} hint={hint} />
    </div>
  );
}

export function ConsentField({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}) {
  const id = useId();

  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-ink)]"
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-[0.8125rem] leading-relaxed text-fg-subtle"
        >
          Autorizo a D.S.C. Seminovos a usar estes dados para entrar em contato
          comigo sobre esta solicitação. Não são usados para outra finalidade.
        </label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-[0.8125rem] text-brand-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
    >
      {label}
      {!required && (
        <span className="ms-1.5 normal-case tracking-normal opacity-70">
          (opcional)
        </span>
      )}
    </label>
  );
}

function FieldFooter({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: string;
}) {
  if (error) {
    return (
      <p
        id={`${id}-error`}
        role="alert"
        className="mt-2 text-[0.8125rem] text-brand-text"
      >
        {error}
      </p>
    );
  }

  if (hint) {
    return (
      <p id={`${id}-hint`} className="mt-2 text-[0.8125rem] text-fg-subtle">
        {hint}
      </p>
    );
  }

  return null;
}
