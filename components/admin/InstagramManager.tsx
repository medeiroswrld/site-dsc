"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  createInstagramUploadTargets,
  deleteInstagramPost,
  discardInstagramUploads,
  registerInstagramPosts,
  reorderInstagramPosts,
  setInstagramLink,
} from "@/lib/admin/instagram-actions";
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

export interface AdminInstagramPost {
  id: string;
  url: string;
  link: string;
}

/**
 * The Instagram strip, managed by hand.
 *
 * Same upload path as the vehicle gallery — shrink in the browser, push
 * straight to storage with a signed URL — plus a field per photo for the post
 * link, so a card sends the visitor to the actual post rather than the profile.
 */
export function InstagramManager({ posts }: { posts: AdminInstagramPost[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
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

    const uploaded: Array<{ path: string; width: number; height: number }> = [];
    let registered = false;

    setFailed(false);
    setMessage(null);

    try {
      setProgress(`Reduzindo ${files.length} foto(s)…`);
      const prepared = [];
      let originalTotal = 0;
      let finalTotal = 0;

      for (const file of files) {
        const photo = await preparePhoto(file);
        originalTotal += photo.originalSize;
        finalTotal += photo.blob.size;
        prepared.push(photo);
      }

      setProgress("Enviando…");
      const targetResult = await createInstagramUploadTargets(
        prepared.map((photo) => photo.type),
      );
      if (!targetResult.ok || !targetResult.targets) {
        throw new Error(targetResult.message ?? "Falha ao preparar o envio.");
      }

      const supabase = createSupabaseBrowserClient();
      const targets = targetResult.targets;

      for (let index = 0; index < prepared.length; index += 1) {
        const photo = prepared[index];
        const target = targets[index];
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .uploadToSignedUrl(target.path, target.token, photo.blob, {
            contentType: photo.type,
          });

        if (!error) {
          uploaded.push({
            path: target.path,
            width: photo.width,
            height: photo.height,
          });
        }
        setProgress(`Enviando ${index + 1}/${prepared.length}…`);
      }

      if (!uploaded.length) throw new Error("Nenhuma foto foi enviada.");

      setProgress("Salvando…");
      const result = await registerInstagramPosts(uploaded);
      if (!result.ok) throw new Error(result.message ?? "Falha ao salvar.");
      registered = true;

      // Um SVG sobe do jeito que veio, então nem sempre há redução a anunciar.
      setMessage(
        originalTotal > finalTotal
          ? `${result.message} Reduzidas de ${formatBytes(originalTotal)} para ${formatBytes(finalTotal)}.`
          : `${result.message}`,
      );
      router.refresh();
    } catch (error) {
      if (!registered && uploaded.length) {
        await discardInstagramUploads(uploaded.map((p) => p.path)).catch(() => {});
      }
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Falha no envio.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...posts];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderInstagramPosts(next.map((post) => post.id)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-lg text-[0.9375rem] leading-relaxed text-fg-muted">
          Estas fotos aparecem no carrossel da página inicial, na ordem abaixo.
          Cole o link de cada publicação para que o card abra o post certo — sem
          link, ele abre o perfil.
        </p>

        <div>
          <input
            ref={inputRef}
            id="fotos-instagram"
            type="file"
            accept="image/*,.svg"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
            }}
          />
          <label
            htmlFor="fotos-instagram"
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

      {progress && (
        <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-fg">
          {progress}
        </p>
      )}

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

      {posts.length === 0 ? (
        <label
          htmlFor="fotos-instagram"
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
          <span className="hatch h-16 w-16 rounded-lg border border-line" />
          <span className="mt-5 font-display text-[1.0625rem] font-semibold text-fg">
            Nenhuma foto ainda
          </span>
          <span className="mt-1.5 max-w-sm text-[0.875rem] leading-relaxed text-fg-muted">
            Enquanto estiver vazio, o carrossel do site mostra espaços
            reservados. Suba seis fotos para ele ganhar vida.
          </span>
        </label>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <li
              key={post.id}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="relative aspect-square bg-surface-2">
                <Image
                  src={post.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  unoptimized={isVectorSource(post.url)}
                  className="object-cover"
                />
                <span className="plate absolute left-2 top-2 rounded-full bg-bg/80 px-2.5 py-1 text-[0.5625rem] uppercase leading-none tracking-[0.1em] text-fg backdrop-blur-md">
                  {index + 1}
                </span>
              </div>

              <div className="space-y-3 p-3">
                <LinkField
                  id={post.id}
                  initial={post.link}
                  disabled={busy}
                  onSaved={(ok, msg) => {
                    setFailed(!ok);
                    setMessage(msg);
                  }}
                />

                <div className="flex items-center justify-between gap-1">
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
                      disabled={index === posts.length - 1 || busy}
                    >
                      <ArrowRight className="text-[0.9375rem]" />
                    </IconButton>
                  </div>

                  <IconButton
                    label={`Excluir a foto ${index + 1}`}
                    disabled={busy}
                    onClick={() => {
                      if (!confirm("Excluir esta foto?")) return;
                      run(() => deleteInstagramPost(post.id));
                    }}
                  >
                    <Close className="text-[0.9375rem]" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LinkField({
  id,
  initial,
  disabled,
  onSaved,
}: {
  id: string;
  initial: string;
  disabled?: boolean;
  onSaved: (ok: boolean, message: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = value.trim() !== initial.trim();

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    const result = await setInstagramLink(id, value);
    setSaving(false);
    onSaved(result.ok, result.message ?? "");
    if (result.ok) router.refresh();
  };

  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
        placeholder="instagram.com/p/…"
        aria-label="Link da publicação"
        className="field h-9 min-w-0 flex-1 px-2.5 text-[0.8125rem]"
      />
      {(dirty || saving) && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-secondary h-9 shrink-0 px-3 text-[0.75rem]"
        >
          {saving ? <Spinner className="h-3 w-3" /> : "Salvar"}
        </button>
      )}
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
