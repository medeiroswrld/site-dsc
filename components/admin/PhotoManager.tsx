"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  createUploadTargets,
  deletePhoto,
  discardUploads,
  registerPhotos,
  reorderPhotos,
} from "@/lib/admin/actions";
import type { AdminPhoto } from "@/lib/admin/queries";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/PendingLink";
import {
  formatBytes,
  isAcceptedImage,
  isVectorSource,
  preparePhoto,
} from "@/lib/image";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface Progress {
  total: number;
  done: number;
  stage: "preparando" | "enviando" | "salvando";
  saved: number;
}

/**
 * Upload, order and remove the gallery.
 *
 * Photos are shrunk in the browser and pushed straight to storage with a
 * signed URL, so the Next server never carries the bytes. Order is changed
 * with explicit arrow buttons rather than drag-and-drop: it works on a phone,
 * works with a keyboard, and the person doing this is usually standing next to
 * the car with one hand free.
 */
export function PhotoManager({
  vehicleId,
  photos,
}: {
  vehicleId: string;
  photos: AdminPhoto[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);

  const busy = pending || progress !== null;

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    startTransition(async () => {
      const result = await fn();
      setFailed(!result.ok);
      setMessage(result.message ?? null);
      router.refresh();
    });

  async function upload(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(isAcceptedImage);
    if (!files.length) {
      setFailed(true);
      setMessage("Nenhum arquivo de imagem reconhecido.");
      return;
    }

    setFailed(false);
    setMessage(null);
    setProgress({ total: files.length, done: 0, stage: "preparando", saved: 0 });

    // Tracked out here so a failure between upload and register can clean up
    // after itself — an orphan file in the bucket is invisible and permanent.
    const uploaded: Array<{ path: string; width: number; height: number }> = [];
    let registered = false;

    try {
      // 1. Shrink everything first, so the size saving is visible up front.
      const prepared = [];
      let originalTotal = 0;
      let finalTotal = 0;

      for (const file of files) {
        const photo = await preparePhoto(file);
        originalTotal += photo.originalSize;
        finalTotal += photo.blob.size;
        prepared.push(photo);
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }

      // 2. One round trip for all the signed URLs.
      setProgress({
        total: files.length,
        done: 0,
        stage: "enviando",
        saved: Math.max(0, originalTotal - finalTotal),
      });

      const targetResult = await createUploadTargets(
        vehicleId,
        prepared.map((photo) => photo.type),
      );
      if (!targetResult.ok || !targetResult.targets) {
        throw new Error(targetResult.message ?? "Falha ao preparar o envio.");
      }

      // 3. Straight to storage, three at a time so a slow line still moves.
      const supabase = createSupabaseBrowserClient();
      const targets = targetResult.targets;
      const failures: string[] = [];

      const queue = prepared.map((photo, index) => ({ photo, target: targets[index] }));
      const CONCURRENCY = 3;

      async function worker() {
        for (;;) {
          const job = queue.shift();
          if (!job) return;

          const { error } = await supabase.storage
            .from(PHOTO_BUCKET)
            .uploadToSignedUrl(job.target.path, job.target.token, job.photo.blob, {
              contentType: job.photo.type,
            });

          if (error) failures.push(`${job.photo.name}: ${error.message}`);
          else
            uploaded.push({
              path: job.target.path,
              width: job.photo.width,
              height: job.photo.height,
            });

          setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        }
      }

      await Promise.all(Array.from({ length: CONCURRENCY }, worker));

      if (!uploaded.length) {
        throw new Error(failures[0] ?? "Nenhuma foto foi enviada.");
      }

      // 4. Record them, keeping the order the person chose.
      setProgress((p) => (p ? { ...p, stage: "salvando" } : p));
      uploaded.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));

      const result = await registerPhotos(vehicleId, uploaded);
      if (!result.ok) throw new Error(result.message ?? "Falha ao salvar.");
      registered = true;

      const savedText =
        originalTotal > finalTotal
          ? ` Reduzidas de ${formatBytes(originalTotal)} para ${formatBytes(finalTotal)}.`
          : "";

      setFailed(failures.length > 0);
      setMessage(
        failures.length
          ? `${uploaded.length} enviada(s). Falharam: ${failures.join(", ")}`
          : (result.message ?? "Fotos enviadas.") + savedText,
      );
      router.refresh();
    } catch (error) {
      // Anything already in the bucket but not in the database is an orphan.
      if (!registered && uploaded.length) {
        await discardUploads(uploaded.map((photo) => photo.path)).catch(() => {});
      }
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Falha no envio.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderPhotos(next.map((photo) => photo.id)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.025em] text-fg">
            Fotos
          </h2>
          <p className="mt-1.5 max-w-md text-[0.875rem] leading-relaxed text-fg-muted">
            A primeira foto é a capa: é ela que aparece nos cards do estoque e
            quando alguém compartilha o link.
          </p>
        </div>

        <div>
          <input
            ref={inputRef}
            id="fotos"
            type="file"
            // `.svg` is spelled out because the picker's own `image/*` filter
            // hides it on some systems.
            accept="image/*,.svg"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
            }}
          />
          <label
            htmlFor="fotos"
            className={cn(
              "btn btn-primary btn-md",
              busy ? "pointer-events-none opacity-60" : "cursor-pointer",
            )}
          >
            {busy && <Spinner />}
            {busy ? "Enviando…" : "Enviar fotos"}
          </label>
        </div>
      </div>

      {progress && <ProgressBar progress={progress} />}

      {message && !progress && (
        <p
          role="status"
          className={cn(
            "mt-4 rounded-xl border px-4 py-3 text-[0.875rem]",
            failed
              ? "border-brand/40 bg-brand/10 text-brand-text"
              : "border-line bg-surface text-fg",
          )}
        >
          {message}
        </p>
      )}

      {photos.length === 0 ? (
        <label
          htmlFor="fotos"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
          }}
          className={cn(
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition-colors duration-200",
            dragging ? "border-brand bg-brand/5" : "border-control hover:border-fg",
          )}
        >
          <span className="hatch h-16 w-24 rounded-lg border border-line" />
          <span className="mt-5 font-display text-[1.0625rem] font-semibold text-fg">
            Nenhuma foto ainda
          </span>
          <span className="mt-1.5 max-w-xs text-[0.875rem] leading-relaxed text-fg-muted">
            Arraste as fotos aqui ou clique para escolher. Elas são reduzidas no
            seu aparelho antes de subir, então nem foto grande de celular
            demora.
          </span>
        </label>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="relative aspect-[4/3] bg-surface-2">
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  unoptimized={isVectorSource(photo.url)}
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="plate absolute left-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[0.5625rem] uppercase leading-none tracking-[0.1em] text-brand-ink">
                    Capa
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <IconButton
                    label={`Mover a foto ${index + 1} para trás`}
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || busy}
                  >
                    <ArrowLeft className="text-[0.9375rem]" />
                  </IconButton>
                  <IconButton
                    label={`Mover a foto ${index + 1} para frente`}
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1 || busy}
                  >
                    <ArrowRight className="text-[0.9375rem]" />
                  </IconButton>
                </div>

                <IconButton
                  label={`Excluir a foto ${index + 1}`}
                  disabled={busy}
                  onClick={() => {
                    if (!confirm("Excluir esta foto?")) return;
                    run(() => deletePhoto(photo.id));
                  }}
                >
                  <Close className="text-[0.9375rem]" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProgressBar({ progress }: { progress: Progress }) {
  const pct = Math.round((progress.done / Math.max(1, progress.total)) * 100);
  const label =
    progress.stage === "preparando"
      ? `Reduzindo ${progress.done}/${progress.total}`
      : progress.stage === "enviando"
        ? `Enviando ${progress.done}/${progress.total}`
        : "Salvando…";

  return (
    <div className="mt-4 rounded-xl border border-line bg-surface px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[0.875rem] text-fg">{label}</p>
        <p className="plate text-[0.75rem] text-fg-subtle tnum">
          {progress.stage === "salvando" ? "" : `${pct}%`}
        </p>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out"
          style={{ width: `${progress.stage === "salvando" ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
        disabled
          ? "border-line text-fg-subtle/40"
          : "border-control text-fg hover:border-fg hover:bg-surface-3",
      )}
    >
      {children}
    </button>
  );
}
