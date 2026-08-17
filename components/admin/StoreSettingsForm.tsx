"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveStoreInfo } from "@/lib/admin/content-actions";
import { Spinner } from "@/components/ui/PendingLink";
import type { StoreInfo } from "@/lib/site-content";
import { cn } from "@/lib/utils";

/**
 * Telephone, address, hours and rating.
 *
 * These feed more than the visible page: the same values go into the
 * schema.org block that Google reads, so a wrong number here is a wrong number
 * in the search result too. That is why the hints are explicit about format.
 */
export function StoreSettingsForm({ store }: { store: StoreInfo }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [hours, setHours] = useState(
    store.hours.length ? store.hours : [{ days: "", time: "" }],
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveStoreInfo(formData);
      setFailed(!result.ok);
      setMessage(result.message ?? null);
      if (result.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field
          name="phoneDisplay"
          label="Telefone"
          defaultValue={store.phoneDisplay}
          hint="Como aparece no site, ex: (15) 3271-0164"
        />
        <Field
          name="phoneE164"
          label="Telefone para discagem"
          defaultValue={store.phoneE164}
          hint="Só dígitos com o país, ex: +551532710164"
        />
        <Field
          name="whatsapp"
          label="WhatsApp (vendas)"
          defaultValue={store.whatsapp}
          hint="Estoque, financiamento e contato. Só dígitos com 55 na frente: 5515999998888"
        />
        <Field
          name="whatsappSellCar"
          label="WhatsApp (avaliação)"
          defaultValue={store.whatsappSellCar}
          hint='Recebe quem quer vender ou trocar, na página "Venda seu carro"'
        />
        <Field
          name="foundedYearsText"
          label="Tempo de mercado"
          defaultValue={store.foundedYearsText}
          hint='Entra na frase da home, ex: "mais de 3 anos"'
        />

        <Field
          name="street"
          label="Rua e número"
          defaultValue={store.street}
          className="sm:col-span-2"
        />
        <Field name="neighbourhood" label="Bairro" defaultValue={store.neighbourhood} />
        <Field name="postalCode" label="CEP" defaultValue={store.postalCode} />
        <Field name="city" label="Cidade" defaultValue={store.city} />
        <Field name="state" label="Estado (sigla)" defaultValue={store.state} />

        <Field
          name="instagramHandle"
          label="Instagram"
          defaultValue={store.instagramHandle}
          hint="Com arroba, ex: @dsc_seminovos"
        />
        <Field
          name="instagramUrl"
          label="Link do Instagram"
          defaultValue={store.instagramUrl}
        />

        <Field
          name="googleReviewsUrl"
          label="Link das avaliações no Google"
          defaultValue={store.googleReviewsUrl}
          className="sm:col-span-2"
          hint="O endereço do perfil da loja no Google, para onde vai o botão de avaliar"
        />

        <Field
          name="ratingValue"
          label="Nota do Google"
          defaultValue={String(store.ratingValue)}
          hint="De 0 a 5, ex: 4.8"
        />
        <Field
          name="ratingCount"
          label="Quantidade de avaliações"
          defaultValue={String(store.ratingCount)}
        />
      </div>

      <fieldset className="mt-9">
        <legend className="font-display text-[0.9375rem] font-semibold text-fg">
          Horários
        </legend>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-muted">
          Uma linha por faixa. Aparecem no rodapé e na página de contato.
        </p>

        <div className="mt-4 space-y-3">
          {hours.map((entry, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3">
              <Field
                name="hoursDays"
                label={index === 0 ? "Dias" : undefined}
                defaultValue={entry.days}
                placeholder="Segunda a sexta"
                className="min-w-[12rem] flex-1"
              />
              <Field
                name="hoursTime"
                label={index === 0 ? "Horário" : undefined}
                defaultValue={entry.time}
                placeholder="08h30 às 18h00"
                className="min-w-[12rem] flex-1"
              />
              <button
                type="button"
                onClick={() => setHours(hours.filter((_, i) => i !== index))}
                disabled={hours.length === 1}
                className="pb-2.5 text-[0.75rem] text-fg-subtle transition-colors hover:text-fg disabled:opacity-30"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setHours([...hours, { days: "", time: "" }])}
          className="mt-3 text-[0.8125rem] text-brand-text transition-colors hover:text-brand-hover"
        >
          + Adicionar horário
        </button>
      </fieldset>

      {message && (
        <p
          role="status"
          className={cn(
            "mt-6 rounded-xl border px-4 py-3 text-[0.875rem]",
            failed
              ? "border-brand/40 bg-brand/10 text-brand-text"
              : "border-line bg-surface text-fg",
          )}
        >
          {message}
        </p>
      )}

      <div className="mt-7 flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary btn-md">
          {pending && <Spinner />}
          {pending ? "Salvando…" : "Salvar dados da loja"}
        </button>
        <p className="text-[0.75rem] text-fg-subtle">
          Campo em branco volta ao valor padrão do site.
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  hint,
  placeholder,
  className,
}: {
  name: string;
  label?: string;
  defaultValue: string;
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={`${name}-${defaultValue.slice(0, 6)}`}
          className="plate block text-[0.6875rem] uppercase tracking-[0.1em] text-fg-subtle"
        >
          {label}
        </label>
      )}
      <input
        id={`${name}-${defaultValue.slice(0, 6)}`}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "mt-2 w-full rounded-xl border border-control bg-surface-2 px-3.5 py-2.5",
          "text-[0.9375rem] text-fg placeholder:text-fg-subtle/60",
          "transition-colors focus:border-fg focus:outline-none",
        )}
      />
      {hint && (
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-fg-subtle">{hint}</p>
      )}
    </div>
  );
}
