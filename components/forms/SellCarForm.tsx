"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  ConsentField,
  TextAreaField,
  TextField,
} from "@/components/forms/Field";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import {
  buildLeadWhatsAppUrl,
  formatPhoneInput,
  isValidPhone,
} from "@/lib/lead";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const steps = [
  { id: 0, label: "Veículo" },
  { id: 1, label: "Detalhes" },
  { id: 2, label: "Contato" },
] as const;

type FieldKey =
  | "brand"
  | "model"
  | "version"
  | "year"
  | "mileage"
  | "color"
  | "notes"
  | "name"
  | "phone";

type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey | "consent", string>>;

const emptyValues: Values = {
  brand: "",
  model: "",
  version: "",
  year: "",
  mileage: "",
  color: "",
  notes: "",
  name: "",
  phone: "",
};

/**
 * Three short steps instead of one long form. Splitting on the natural
 * boundaries — what the car is, what shape it is in, who to call — keeps each
 * screen answerable from memory.
 */
export function SellCarForm() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Values>(emptyValues);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const set = (key: FieldKey) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const validateStep = (target: number): Errors => {
    const next: Errors = {};

    if (target === 0) {
      if (!values.brand.trim()) next.brand = "Informe a marca.";
      if (!values.model.trim()) next.model = "Informe o modelo.";
      if (!/^\d{4}$/.test(values.year.trim()))
        next.year = "Informe o ano com quatro dígitos, como 2019.";
      if (!values.mileage.trim())
        next.mileage = "Informe a quilometragem aproximada.";
    }

    if (target === 2) {
      if (values.name.trim().length < 2) next.name = "Informe seu nome.";
      if (!isValidPhone(values.phone))
        next.phone = "Informe um telefone com DDD, como (15) 99999-9999.";
      if (!consent)
        next.consent = "É preciso autorizar o contato para enviar.";
    }

    return next;
  };

  const goTo = (target: number) => {
    if (target > step) {
      const stepErrors = validateStep(step);
      setErrors(stepErrors);
      if (Object.keys(stepErrors).length > 0) return;
    }

    setDirection(target > step ? 1 : -1);
    setErrors({});
    setStep(target);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const stepErrors = validateStep(2);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    const url = buildLeadWhatsAppUrl({
      kind: "venda",
      fields: [
        { label: "Nome", value: values.name },
        { label: "WhatsApp", value: values.phone },
        { label: "Marca", value: values.brand },
        { label: "Modelo", value: values.model },
        { label: "Versão", value: values.version },
        { label: "Ano", value: values.year },
        { label: "Quilometragem", value: values.mileage },
        { label: "Cor", value: values.color },
        { label: "Observações", value: values.notes },
      ],
    });

    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (sentUrl) {
    return (
      <FormSuccess
        title="Informações enviadas"
        body="A conversa no WhatsApp abre com os dados do seu veículo. A equipe da D.S.C. analisa e retorna com o próximo passo da avaliação."
        whatsappUrl={sentUrl}
        onReset={() => {
          setValues(emptyValues);
          setConsent(false);
          setStep(0);
          setSentUrl(null);
        }}
        resetLabel="Enviar outro veículo"
      />
    );
  }

  const offset = reduced ? 0 : 24;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ol className="flex gap-2" aria-label="Etapas do formulário">
        {steps.map((item) => {
          const state =
            item.id === step ? "current" : item.id < step ? "done" : "todo";

          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => item.id < step && goTo(item.id)}
                disabled={item.id > step}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "w-full border-t-2 pt-3 text-left transition-colors duration-300",
                  state === "todo" ? "border-line" : "border-fg",
                  item.id < step && "cursor-pointer",
                  item.id > step && "cursor-default",
                )}
              >
                <span className="plate block text-[0.625rem] uppercase tracking-[0.14em] text-fg-subtle">
                  {String(item.id + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-[0.875rem]",
                    state === "todo" ? "text-fg-subtle" : "text-fg",
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-9">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -offset }}
            transition={{ duration: reduced ? 0.15 : 0.32, ease: EASE }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    label="Marca"
                    required
                    value={values.brand}
                    onChange={set("brand")}
                    error={errors.brand}
                    placeholder="Chevrolet"
                  />
                  <TextField
                    label="Modelo"
                    required
                    value={values.model}
                    onChange={set("model")}
                    error={errors.model}
                    placeholder="Onix"
                  />
                </div>

                <TextField
                  label="Versão"
                  value={values.version}
                  onChange={set("version")}
                  placeholder="LTZ 1.0 Turbo"
                  hint="Se não souber a versão exata, pode deixar em branco."
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    label="Ano"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    value={values.year}
                    onChange={(value) =>
                      set("year")(value.replace(/\D/g, "").slice(0, 4))
                    }
                    error={errors.year}
                    placeholder="2019"
                  />
                  <TextField
                    label="Quilometragem"
                    required
                    inputMode="numeric"
                    value={values.mileage}
                    onChange={(value) => {
                      const digits = value.replace(/\D/g, "").slice(0, 7);
                      set("mileage")(
                        digits ? `${Number(digits).toLocaleString("pt-BR")} km` : "",
                      );
                    }}
                    error={errors.mileage}
                    placeholder="70.000 km"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <TextField
                  label="Cor"
                  value={values.color}
                  onChange={set("color")}
                  placeholder="Prata"
                />

                <TextAreaField
                  label="Observações"
                  rows={5}
                  value={values.notes}
                  onChange={set("notes")}
                  placeholder="Estado de conservação, itens opcionais, manutenções recentes, algum detalhe de lataria."
                />

                {/* INTEGRATION POINT: photo upload needs storage and an
                    endpoint. Until then, photos are requested in the WhatsApp
                    conversation, where the visitor already has them to hand. */}
                <p className="rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.8125rem] leading-relaxed text-fg-subtle">
                  Tem fotos do carro? Envie direto na conversa do WhatsApp
                  depois de concluir — ajuda bastante na avaliação.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    label="Nome"
                    required
                    value={values.name}
                    onChange={set("name")}
                    error={errors.name}
                    autoComplete="name"
                    placeholder="Como podemos te chamar"
                  />
                  <TextField
                    label="WhatsApp"
                    required
                    type="tel"
                    inputMode="tel"
                    value={values.phone}
                    onChange={(value) => set("phone")(formatPhoneInput(value))}
                    error={errors.phone}
                    autoComplete="tel"
                    placeholder="(15) 99999-9999"
                  />
                </div>

                <ConsentField
                  checked={consent}
                  onChange={setConsent}
                  error={errors.consent}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-9 flex items-center gap-3 border-t border-line pt-7">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="group inline-flex h-13 items-center gap-2 rounded-full border border-control px-5 text-[0.9375rem] font-medium text-fg transition-colors duration-200 hover:border-fg"
          >
            <ArrowLeft className="text-[1rem] transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:-translate-x-1" />
            Voltar
          </button>
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            className="btn btn-primary btn-lg"
          >
            Continuar
            <ArrowRight className="text-[1rem] transition-transform duration-300 ease-[var(--ease-out-quart)] group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary btn-lg ms-auto"
          >
            Enviar para avaliação
          </button>
        )}
      </div>
    </form>
  );
}
