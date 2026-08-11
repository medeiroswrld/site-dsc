import Image from "next/image";
import lockup from "@/public/brand/dsc-seminovos.png";
import mark from "@/public/brand/dsc-mark.png";
import { cn } from "@/lib/utils";

/**
 * The store's own lockup: "D.S.C / SEMINOVOS" beside the orange hatchback.
 *
 * This is the delivered artwork, not a redraw. The only edit is the lettering,
 * lifted from black to the site's silver so it reads on the dark ground —
 * /public/brand/dsc-seminovos-dark.png keeps the original black version for
 * anything that lands on white (documentos, impressos, assinatura de e-mail).
 *
 * Only the height is set; the width follows from the file's own ratio, so the
 * lockup scales without a second number to keep in sync.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src={lockup}
      alt="D.S.C. Seminovos"
      priority
      sizes="200px"
      className={cn("h-7 w-auto sm:h-8", className)}
    />
  );
}

/** The hatchback on its own — the compact mark the painel uses. */
export function CarMark({ className }: { className?: string }) {
  return (
    <Image
      src={mark}
      alt=""
      aria-hidden="true"
      sizes="140px"
      className={cn("w-auto", className)}
    />
  );
}
