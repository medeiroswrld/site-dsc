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
  formatPhoneInput,
  isValidPhone,
} from "@/lib/lead";

const subjects = [
  "Quero saber sobre um veículo do estoque",
  "Quero vender ou trocar meu carro",
  "Quero falar sobre financiamento",
  "Quero agendar uma visita à loja",
  "Outro assunto",
];

type Errors = Partial<Record<"name" | "phone" | "subject" | "consent", string>>;

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (name.trim().length < 2) nextErrors.name = "Informe seu nome.";
    if (!isValidPhone(phone))
      nextErrors.phone = "Informe um telefone com DDD, como (15) 99999-9999.";
    if (!subject) nextErrors.subject = "Escolha o assunto.";
    if (!consent)
      nextErrors.consent = "É preciso autorizar o contato para enviar.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const url = buildLeadWhatsAppUrl({
      kind: "contato",
      fields: [
        { label: "Nome", value: name },
        { label: "WhatsApp", value: phone },
        { label: "Assunto", value: subject },
        { label: "Mensagem", value: message },
      ],
    });

    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (sentUrl) {
    return (
      <FormSuccess
        title="Mensagem pronta para enviar"
        body="A conversa no WhatsApp abre com o que você escreveu. É por lá que a equipe da D.S.C. responde mais rápido."
        whatsappUrl={sentUrl}
        onReset={() => {
          setName("");
          setPhone("");
          setSubject("");
          setMessage("");
          setConsent(false);
          setSentUrl(null);
        }}
        resetLabel="Escrever outra mensagem"
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
          label="WhatsApp"
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
        label="Assunto"
        required
        value={subject}
        onChange={setSubject}
        options={subjects}
        error={errors.subject}
        placeholder="Sobre o que você quer falar"
      />

      <TextAreaField
        label="Mensagem"
        value={message}
        onChange={setMessage}
        rows={5}
        placeholder="Conte o que você procura. Se for sobre um veículo específico, cite o modelo."
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
        Enviar mensagem
      </button>
    </form>
  );
}
