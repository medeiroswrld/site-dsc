import Image from "next/image";
import { isVectorSource } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { VehicleImage } from "@/types/vehicle";

interface VehiclePhotoProps {
  image: VehicleImage;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Use the full-resolution source when one exists (lightbox only). */
  full?: boolean;
}

/**
 * Wraps next/image with the one rule this project needs: vector sources skip
 * the optimiser — placeholder frames and any SVG the store uploads — while real
 * photography goes through it and gets AVIF/WebP plus a srcset.
 */
export function VehiclePhoto({
  image,
  sizes,
  className,
  priority,
  full,
}: VehiclePhotoProps) {
  const src = full && image.full ? image.full : image.src;

  return (
    <Image
      src={src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={image.isPlaceholder || isVectorSource(src)}
      // The photograph is the product here, so it does not get the default 75.
      quality={90}
      className={cn("object-cover", className)}
    />
  );
}
