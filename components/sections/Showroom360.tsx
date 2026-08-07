import { media } from "@/lib/site";

/**
 * Placeholder mount point for a real 360° experience.
 *
 * The section renders nothing until an actual equirectangular panorama is set
 * on `media.showroomPanorama`. There is deliberately no CSS-faked "360" — a
 * simulated tour would misrepresent the store.
 *
 * TO ENABLE:
 *   1. Capture a panorama of the showroom (2:1 equirectangular JPEG).
 *   2. Save it to /public/media/showroom-360.jpg.
 *   3. Set `showroomPanorama` in lib/site.ts to that path.
 *   4. Install a viewer (e.g. `@photo-sphere-viewer/core`) and render it
 *      below, lazily — it must not ship in the initial bundle.
 */
export function Showroom360() {
  if (!media.showroomPanorama) return null;

  return null;
}
