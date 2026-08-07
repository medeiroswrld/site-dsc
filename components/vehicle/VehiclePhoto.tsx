import Image from "next/image";
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
 * Wraps next/image with the one rule this project needs: placeholder frames
 * are vector stand-ins and must skip the optimiser, real photography goes
 * through it and gets AVIF/WebP plus a srcset.
 */
export function VehiclePhoto({
  image,
  sizes,
  className,
  priority,
  full,
}: VehiclePhotoProps) {
  return (
    <Image
      src={full && image.full ? image.full : image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={image.isPlaceholder}
      className={cn("object-cover", className)}
    />
  );
}
