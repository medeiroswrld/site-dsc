"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  clearSiteMedia,
  createSiteMediaTarget,
  discardSiteUpload,
  registerSiteMedia,
} from "@/lib/admin/content-actions";
import { Spinner } from "@/components/ui/PendingLink";
import {
  formatBytes,
  isAcceptedImage,
  isVectorSource,
  preparePhoto,
} from "@/lib/image";
import type { MediaSlot } from "@/lib/site-content";
import type { MediaMap } from "@/lib/site-content-repository";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

/**
 * The named frames of the site, each showing the picture currently in it.
 *
 * One card per slot rather than one long form: the person doing this is
 * replacing a specific photo they can see, not filling in a record. Each card
 * uploads on its own, so a failure in one never costs the others.
 */
export function SiteMediaManager({
  slots,
  media,
}: {
  slots: MediaSlot[];
  media: MediaMap;
}) {
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <SlotCard key={slot.id} slot={slot} current={media[slot.id]} />
      ))}
    </ul>
  );
}

function SlotCard({
  slot,
  current,
}: {
  slot: MediaSlot;
  current: MediaMap[string] | undefined;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const busy = pending || progress !== null;
  const isVideo = slot.kind === "video";
  const filled = Boolean(current && !current.isPlaceholder && current.src);

  async function upload(file: File) {
    setFailed(false);
    setMessage(null);

    let uploadedPath: string | null = null;
    let registered = false;

    try {
      if (isVideo) {
        if (!file.type.startsWith("video/")) {
          throw new Error("Escolha um arquivo de vídeo, em MP4 ou WebM.");
        }
      } else if (!isAcceptedImage(file)) {
        throw new Error("Escolha um arquivo de imagem.");
      }

      // Video goes up untouched: the browser cannot re-encode it, and the
      // 50 MB ceiling of the bucket is the only guard that matters here.
      setProgress(isVideo ? "Enviando…" : "Reduzindo…");
      const photo = isVideo
        ? {
            blob: file as Blob,
            type: file.type,
            width: 0,
            height: 0,
            originalSize: file.size,
          }
        : await preparePhoto(file);

      const targetResult = await createSiteMediaTarget(slot.id, photo.type);
      if (!targetResult.ok || !targetResult.target) {
        throw new Error(targetResult.message ?? "Falha ao preparar o envio.");
      }

      setProgress("Enviando…");
      const supabase = createSupabaseBrowserClient();
      const { path, token } = targetResult.target;

      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .uploadToSignedUrl(path, token, photo.blob, { contentType: photo.type });

      if (error) throw new Error(error.message);
      uploadedPath = path;

      setProgress("Salvando…");
      const result = await registerSiteMedia(slot.id, {
        path,
        width: photo.width,
        height: photo.height,
      });
      if (!result.ok) throw new Error(result.message ?? "Falha ao salvar.");
      registered = true;

      const saved =
        !isVideo && photo.originalSize > photo.blob.size
          ? ` (${formatBytes(photo.originalSize)} → ${formatBytes(photo.blob.size)})`
          : "";
      setMessage((result.message ?? "Atualizado.") + saved);
      router.refresh();
    } catch (error) {
      // A file sitting in the bucket with no row pointing at it is invisible
      // and permanent, so it goes out on the way through.
      if (!registered && uploadedPath) {
        await discardSiteUpload(uploadedPath).catch(() => {});
      }
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Falha no envio.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const reset = () =>
    startTransition(async () => {
      const result = await clearSiteMedia(slot.id);
      setFailed(!result.ok);
      setMessage(result.message ?? null);
      router.refresh();
    });

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative bg-surface-2" style={{ aspectRatio: slot.aspect }}>
        {isVideo ? (
          filled ? (
            <video
              key={current?.src}
              src={current?.src}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="hatch h-14 w-20 rounded-lg border border-line" />
            </div>
          )
        ) : (
          current?.src && (
            <Image
              src={current.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, 45vw"
              unoptimized={current.isPlaceholder || isVectorSource(current.src)}
              className="object-cover"
            />
          )
        )}

        {!filled && (
          <span className="plate absolute left-2 top-2 rounded-full bg-bg/80 px-2.5 py-1 text-[0.5625rem] uppercase leading-none tracking-[0.1em] text-fg-subtle backdrop-blur-md">
            {isVideo ? "Sem vídeo" : "Padrão"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[0.9375rem] font-semibold text-fg">
          {slot.label}
        </h3>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-subtle">
          {slot.where}
        </p>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-fg-muted">
          {slot.hint}
        </p>

        {message && (
          <p
            role="status"
            className={cn(
              "mt-3 rounded-lg border px-3 py-2 text-[0.75rem] leading-relaxed",
              failed
                ? "border-brand/40 bg-brand/10 text-brand-text"
                : "border-line bg-surface-2 text-fg",
            )}
          >
            {message}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 pt-1">
          <input
            ref={inputRef}
            id={`slot-${slot.id}`}
            type="file"
            accept={isVideo ? "video/mp4,video/webm" : "image/*,.svg"}
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <label
            htmlFor={`slot-${slot.id}`}
            className={cn(
              "btn btn-secondary btn-sm",
              busy ? "pointer-events-none opacity-60" : "cursor-pointer",
            )}
          >
            {busy && <Spinner />}
            {progress ?? (filled ? "Trocar" : "Enviar")}
          </label>

          {filled && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="px-2 py-1 text-[0.75rem] text-fg-subtle transition-colors hover:text-fg disabled:opacity-40"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
