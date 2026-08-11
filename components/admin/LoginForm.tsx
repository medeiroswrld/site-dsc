"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/PendingLink";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * The only place the browser talks to Supabase directly: it exchanges the
 * email and password for a session cookie. Every write after this point goes
 * through a server action.
 */
export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  /**
   * Until React has hydrated, `onSubmit` does not exist and a click would make
   * the browser submit the form natively — navigating away and silently
   * throwing the credentials out. The button waits for the handler to be real.
   */
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      // Supabase returns the same message for a wrong email and a wrong
      // password, which is the behaviour we want — no account enumeration.
      setError("E-mail ou senha incorretos.");
      setPending(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="email"
          className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
        >
          E-mail
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

      <div>
        <label
          htmlFor="password"
          className="plate mb-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-fg-subtle"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <Link
        href="/admin/esqueci-senha"
        className="block text-center text-[0.875rem] text-fg-subtle underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        Esqueci minha senha
      </Link>
    </form>
  );
}
