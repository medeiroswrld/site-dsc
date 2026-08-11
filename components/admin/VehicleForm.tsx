"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveVehicle } from "@/lib/admin/actions";
import type { AdminVehicle } from "@/lib/admin/queries";
import {
  BODY_TYPES,
  FUELS,
  STATUSES,
  TRANSMISSIONS,
  type FieldErrors,
} from "@/lib/admin/schema";
import { cn } from "@/lib/utils";

/**
 * One form for creating and for editing — the only difference is whether an id
 * is passed in. Validation lives on the server, and the errors it returns are
 * mapped back onto the fields by name.
 */
export function VehicleForm({ vehicle }: { vehicle?: AdminVehicle }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveVehicle(vehicle?.id ?? null, formData);

      setErrors(result.errors ?? {});
      setMessage(result.message ?? null);
      setFailed(!result.ok);

      if (result.ok && !vehicle && result.id) {
        // A new vehicle needs its photos next, so go straight to the editor.
        router.push(`/admin/veiculos/${result.id}?novo=1`);
        return;
      }
      if (result.ok) router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <Section title="Identificação">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Marca" name="brand" required error={errors.brand}
            defaultValue={vehicle?.brand} placeholder="Chevrolet" />
          <Field label="Modelo" name="model" required error={errors.model}
            defaultValue={vehicle?.model} placeholder="Tracker" />
        </div>
        <Field label="Versão" name="version" error={errors.version}
          defaultValue={vehicle?.version} placeholder="Premier 1.2 Turbo"
          hint="Como aparece no documento. Entra no título da página e na URL." />
      </Section>

      <Section title="Números">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Ano de fabricação" name="yearManufacture" required
            inputMode="numeric" error={errors.yearManufacture}
            defaultValue={vehicle?.year_manufacture} placeholder="2023" />
          <Field label="Ano do modelo" name="yearModel" required
            inputMode="numeric" error={errors.yearModel}
            defaultValue={vehicle?.year_model} placeholder="2023" />
          <Field label="Quilometragem" name="mileage" required
            inputMode="numeric" error={errors.mileage}
            defaultValue={vehicle?.mileage} placeholder="31400" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preço" name="price" inputMode="numeric"
            error={errors.price}
            defaultValue={vehicle?.price ?? ""}
            placeholder="119900"
            hint="Só números. Em branco, o site mostra “Sob consulta”." />
          <Field label="Portas" name="doors" required inputMode="numeric"
            error={errors.doors} defaultValue={vehicle?.doors ?? 4} />
        </div>
      </Section>

      <Section title="Ficha técnica">
        <div className="grid gap-5 sm:grid-cols-3">
          <Select label="Câmbio" name="transmission" required
            error={errors.transmission}
            defaultValue={vehicle?.transmission}
            options={[...TRANSMISSIONS]} />
          <Select label="Combustível" name="fuel" required error={errors.fuel}
            defaultValue={vehicle?.fuel} options={[...FUELS]} />
          <Select label="Carroceria" name="bodyType" required
            error={errors.bodyType} defaultValue={vehicle?.body_type}
            options={[...BODY_TYPES]} />
        </div>
        <Field label="Cor" name="color" error={errors.color}
          defaultValue={vehicle?.color} placeholder="Branco" />
      </Section>

      <Section title="Texto do anúncio">
        <TextArea label="Descrição" name="description" rows={5}
          error={errors.description} defaultValue={vehicle?.description}
          placeholder="Estado de conservação, histórico, o que o comprador precisa saber."
          hint="Escreva o que é verdade sobre o carro. Sem promessa de garantia ou revisão que a loja não tenha feito." />

        <TextArea label="Itens do veículo" name="features" rows={6}
          error={errors.features}
          defaultValue={(vehicle?.features ?? []).join("\n")}
          placeholder={"Teto solar\nCâmera de ré\nPiloto automático"}
          hint="Um item por linha." />

        <Field label="Link de um vídeo do veículo" name="videoUrl"
          error={errors.videoUrl} defaultValue={vehicle?.video_url ?? ""}
          placeholder="https://youtube.com/..."
          hint="Opcional. Aparece um botão na galeria quando preenchido." />
      </Section>

      <Section title="Publicação">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Situação" name="status" required defaultValue={vehicle?.status ?? "available"}
            options={STATUSES.map((s) => s.value)}
            labels={Object.fromEntries(STATUSES.map((s) => [s.value, s.label]))}
            error={errors.status} />

          <label className="flex cursor-pointer items-start gap-3 self-end pb-3">
            <input
              type="checkbox"
              name="featured"
              value="true"
              defaultChecked={vehicle?.featured ?? false}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-brand)]"
            />
            <span className="text-[0.875rem] leading-relaxed text-fg-muted">
              Marcar como <span className="text-fg">destaque</span> — aparece
              primeiro na página inicial.
            </span>
          </label>
        </div>
      </Section>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-xl border px-4 py-3 text-[0.875rem]",
            failed
              ? "border-brand/40 bg-brand/10 text-brand-text"
              : "border-line bg-surface text-fg",
          )}
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-7">
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
          {pending
            ? "Salvando…"
            : vehicle
              ? "Salvar alterações"
              : "Cadastrar e adicionar fotos"}
        </button>
        <a href="/admin" className="btn btn-secondary btn-lg">
          Cancelar
        </a>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="plate mb-1 text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function Label({ name, label, required }: BaseProps) {
  return (
    <label
      htmlFor={name}
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

function Footer({ name, error, hint }: BaseProps) {
  if (error)
    return (
      <p id={`${name}-error`} role="alert" className="mt-2 text-[0.8125rem] text-brand-text">
        {error}
      </p>
    );
  if (hint)
    return (
      <p id={`${name}-hint`} className="mt-2 text-[0.8125rem] text-fg-subtle">
        {hint}
      </p>
    );
  return null;
}

function Field({
  defaultValue,
  placeholder,
  inputMode,
  ...base
}: BaseProps & {
  defaultValue?: string | number;
  placeholder?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <div className="min-w-0">
      <Label {...base} />
      <input
        id={base.name}
        name={base.name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={
          base.error ? `${base.name}-error` : base.hint ? `${base.name}-hint` : undefined
        }
        className="field h-12 px-3.5 text-[0.9375rem]"
      />
      <Footer {...base} />
    </div>
  );
}

function TextArea({
  defaultValue,
  placeholder,
  rows = 4,
  ...base
}: BaseProps & {
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="min-w-0">
      <Label {...base} />
      <textarea
        id={base.name}
        name={base.name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={
          base.error ? `${base.name}-error` : base.hint ? `${base.name}-hint` : undefined
        }
        className="field resize-y px-3.5 py-3 text-[0.9375rem]"
      />
      <Footer {...base} />
    </div>
  );
}

function Select({
  defaultValue,
  options,
  labels,
  ...base
}: BaseProps & {
  defaultValue?: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="min-w-0">
      <Label {...base} />
      <select
        id={base.name}
        name={base.name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={base.error ? true : undefined}
        aria-describedby={base.error ? `${base.name}-error` : undefined}
        className="field h-12 cursor-pointer px-3.5 text-[0.9375rem]"
      >
        <option value="">Escolha…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
      <Footer {...base} />
    </div>
  );
}
