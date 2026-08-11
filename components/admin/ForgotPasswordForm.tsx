"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/PendingLink";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Sends the recovery e-mail.
 *
 * The response is deliberately identical whether or not the address exists —
 * telling a stranger which e-mails have accounts is free reconnaissance.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);

    const supabase = createSupabaseBrowserClient();
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/admin/nova-senha` },
    );

    setPending(false);

    // Rate limiting is worth surfacing — it is actionable. Anything else stays
    // generic so the form cannot be used to probe for accounts.
    if (requestError?.status === 429) {
      setError("Muitas tentativas. Espere alguns minutos e tente de novo.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-[1.0625rem] font-semibold text-fg">
          Verifique seu e-mail
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Se existir uma conta para <span className="text-fg">{email}</span>,
          o link de redefinição chega em instantes. Ele vale por uma hora.
        </p>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-fg-subtle">
          Não chegou? Confira a caixa de spam.
        </p>
        <Link href="/admin/login" className="btn btn-secondary btn-md mt-5">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="email"
          className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
        >
          E-mail da conta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field h-12 px-3.5 text-[0.9375rem]"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-[0.875rem] text-brand-text">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready || pending}
        className="btn btn-primary btn-lg w-full"
      >
        {pending && <Spinner />}
        {pending ? "Enviando…" : "Enviar link de redefinição"}
      </button>

      <Link
        href="/admin/login"
        className="block text-center text-[0.875rem] text-fg-subtle underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        Lembrei a senha
      </Link>
    </form>
  );
}
