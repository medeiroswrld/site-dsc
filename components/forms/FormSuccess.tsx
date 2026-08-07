"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, WhatsApp } from "@/components/ui/icons";

/**
 * What the visitor sees after a valid submission. The WhatsApp link is the
 * real handoff, and it stays on screen in case the browser blocked the tab
 * that was opened automatically.
 */
export function FormSuccess({
  title,
  body,
  whatsappUrl,
  onReset,
  resetLabel,
}: {
  title: string;
  body: string;
  whatsappUrl: string;
  onReset: () => void;
  resetLabel: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="status"
      className="rounded-2xl border border-line bg-surface p-8 lg:p-10"
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-brand-ink">
        <Check className="text-[1.25rem]" />
      </span>

      <h2 className="mt-5 font-display text-[1.375rem] font-semibold tracking-[-0.025em] text-fg">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-[1rem] leading-relaxed text-fg-muted">
        {body}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-md"
        >
          <WhatsApp className="text-[1.125rem]" />
          Abrir a conversa no WhatsApp
        </a>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-md"
        >
          {resetLabel}
        </button>
      </div>
    </motion.div>
  );
}
