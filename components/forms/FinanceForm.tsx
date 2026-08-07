"use client";

import { useState } from "react";
import {
  ConsentField,
  FormSelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/Field";
import { FormSuccess } from "@/components/forms/FormSuccess";
import {
  buildLeadWhatsAppUrl,
  formatCurrencyInput,
  formatPhoneInput,
  isValidPhone,
} from "@/lib/lead";
import type { Vehicle } from "@/types/vehicle";

interface FinanceFormProps {
  /** Every vehicle in stock, so the visitor picks rather than types. */
  vehicles: Vehicle[];
  /** Slug arriving from a vehicle page's "Simular financiamento". */
  preselectedSlug?: string;
}

type Errors = Partial<Record<"name" | "phone" | "vehicle" | "consent", string>>;

export function FinanceForm({ vehicles, preselectedSlug }: FinanceFormProps) {
  const options = vehicles
    .filter((vehicle) => vehicle.status !== "sold")
    .map((vehicle) => `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.yearModel}`);

  const preselected = preselectedSlug
    ? vehicles.find((vehicle) => vehicle.slug === preselectedSlug)
    : undefined;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState(
    preselected
      ? `${preselected.brand} ${preselected.model} ${preselected.version} ${preselected.yearModel}`
      : "",
  );
  const [downPayment, setDownPayment] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPhone("");
    setVehicle("");
    setDownPayment("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setSentUrl(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (name.trim().length < 2) nextErrors.name = "Informe seu nome.";
    if (!isValidPhone(phone))
      nextErrors.phone = "Informe um telefone com DDD, como (15) 99999-9999.";
    if (!vehicle) nextErrors.vehicle = "Escolha o veículo de interesse.";
    if (!consent)
      nextErrors.consent = "É preciso autorizar o contato para enviar.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const url = buildLeadWhatsAppUrl({
      kind: "financiamento",
      fields: [
        { label: "Nome", value: name },
        { label: "WhatsApp", value: phone },
        { label: "Veículo de interesse", value: vehicle },
        { label: "Entrada aproximada", value: downPayment },
        { label: "Observações", value: message },
      ],
    });

    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (sentUrl) {
    return (
      <FormSuccess
        title="Dados enviados para a equipe"
        body="A conversa no WhatsApp abre com tudo o que você preencheu. A equipe da D.S.C. responde com as possibilidades disponíveis para o seu caso."
        whatsappUrl={sentUrl}
        onReset={reset}
        resetLabel="Enviar outra solicitação"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Nome"
          required
          value={name}
          onChange={setName}
          error={errors.name}
          autoComplete="name"
          placeholder="Como podemos te chamar"
        />
        <TextField
          label="Telefone / WhatsApp"
          required
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(value) => setPhone(formatPhoneInput(value))}
          error={errors.phone}
          autoComplete="tel"
          placeholder="(15) 99999-9999"
        />
      </div>

      <FormSelectField
        label="Veículo de interesse"
        required
        value={vehicle}
        onChange={setVehicle}
        options={options}
        error={errors.vehicle}
        placeholder="Escolha um veículo do estoque"
      />

      <TextField
        label="Valor aproximado de entrada"
        value={downPayment}
        onChange={(value) => setDownPayment(formatCurrencyInput(value))}
        inputMode="numeric"
        placeholder="R$ 0"
        hint="Ajuda a equipe a montar a proposta. Pode deixar em branco."
      />

      <TextAreaField
        label="Mensagem"
        value={message}
        onChange={setMessage}
        placeholder="Tem um carro para dar na troca? Prefere ser atendido em algum horário? Conte aqui."
      />

      <ConsentField
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />

      <button
        type="submit"
        className="btn btn-primary btn-lg w-full sm:w-auto"
      >
        Solicitar uma simulação
      </button>
    </form>
  );
}
