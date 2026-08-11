"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/PendingLink";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MIN_LENGTH = 8;

/**
 * Sets a new password.
 *
 * Serves two arrivals: someone who followed a recovery link (Supabase turns
 * the URL fragment into a session automatically), and someone already signed
 * in who just wants to change it. Both end up calling the same update.
 */
export function NewPasswordForm({
  /** Recovery arrivals have no session until Supabase processes the link. */
  requireSession = true,
}: {
  requireSession?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [status, setStatus] = useState<"checking" | "ready" | "no-session">(
    requireSession ? "checking" : "ready",
  );

  useEffect(() => {
    if (!requireSession) return;

    const supabase = createSupabaseBrowserClient();

    // The recovery link carries the token in the URL fragment, which the
    // client picks up on load — so the session may appear a beat after mount.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "no-session");
    });

    return () => sub.subscription.unsubscribe();
  }, [requireSession]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`A senha precisa ter pelo menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      setError("As duas senhas não são iguais.");
      return;
    }

    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    router.refresh();
  };

  if (status === "checking") {
    return (
      <p className="flex items-center gap-2.5 text-[0.9375rem] text-fg-muted">
        <Spinner />
        Validando o link…
      </p>
    );
  }

  if (status === "no-session") {
    return (
      <div className="rounded-2xl border border-brand/40 bg-brand/10 p-6">
        <h2 className="font-display text-[1.0625rem] font-semibold text-fg">
          Link inválido ou expirado
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Os links de redefinição valem por uma hora e só podem ser usados uma
          vez. Peça um novo.
        </p>
        <a href="/admin/esqueci-senha" className="btn btn-primary btn-md mt-5">
          Pedir novo link
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-[1.0625rem] font-semibold text-fg">
          Senha alterada
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">
          Sua nova senha já está valendo.
        </p>
        <a href="/admin" className="btn btn-primary btn-md mt-5">
          Ir para o painel
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="senha"
          className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
        >
          Nova senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="field h-12 px-3.5 text-[0.9375rem]"
          required
        />
        <p className="mt-2 text-[0.8125rem] text-fg-subtle">
          Pelo menos {MIN_LENGTH} caracteres.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmacao"
          className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
        >
          Repita a nova senha
        </label>
        <input
          id="confirmacao"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
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
        disabled={pending}
        className="btn btn-primary btn-lg w-full"
      >
        {pending && <Spinner />}
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
