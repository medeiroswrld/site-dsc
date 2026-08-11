import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CarMark } from "@/components/layout/Wordmark";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Configurar o painel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "Crie o projeto no Supabase",
    body: "Entre em supabase.com, crie uma conta gratuita e um projeto novo. Escolha a região South America (São Paulo) — o banco fica mais perto e o site responde mais rápido.",
  },
  {
    title: "Rode o schema",
    body: "No projeto, abra o SQL Editor, cole o conteúdo do arquivo supabase/schema.sql que está na pasta do site e clique em RUN. Isso cria as tabelas dos veículos, das fotos e o bucket de imagens.",
  },
  {
    title: "Crie o seu login",
    body: "Em Authentication › Users › Add user, cadastre o e-mail e a senha que você vai usar para entrar aqui. Marque a opção Auto Confirm User.",
  },
  {
    title: "Copie as chaves",
    body: "Em Settings › API, copie a Project URL, a chave anon public e a chave service_role para um arquivo .env.local na pasta do site (o .env.example mostra o formato). Depois reinicie o servidor.",
  },
];

export default function SetupPage() {
  if (isSupabaseConfigured) redirect("/admin");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <CarMark className="h-7 w-auto" />

      <h1 className="mt-7 font-display text-[1.875rem] font-semibold tracking-[-0.03em] text-fg">
        Falta conectar o banco de dados
      </h1>
      <p className="mt-3 text-[1rem] leading-relaxed text-fg-muted">
        O painel guarda os veículos e as fotos no Supabase. São quatro passos,
        uma vez só. Enquanto isso, o site continua no ar mostrando o estoque de
        demonstração.
      </p>

      <ol className="mt-10 border-t border-line">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-5 border-b border-line py-5">
            <span className="plate shrink-0 pt-0.5 text-[0.75rem] text-brand-text">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display text-[1.0625rem] font-semibold text-fg">
                {step.title}
              </p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <p className="plate text-[0.6875rem] uppercase tracking-[0.14em] text-fg-subtle">
          .env.local
        </p>
        <pre className="plate mt-4 overflow-x-auto text-[0.8125rem] leading-relaxed text-fg-muted">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`}
        </pre>
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-fg-subtle">
          A chave <span className="plate text-fg-muted">service_role</span> dá
          acesso total ao banco. Ela fica só no servidor — nunca a coloque num
          arquivo que comece com NEXT_PUBLIC, e nunca a envie para o Git.
        </p>
      </div>
    </div>
  );
}
