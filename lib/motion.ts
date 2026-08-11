/**
 * Motion vocabulary for the whole site.
 *
 * Apple describes springs with two numbers — damping ratio (how much it
 * overshoots) and response (how quickly it gets there) — instead of the
 * physics triplet. Motion's `bounce` + `duration` maps onto that directly:
 * bounce 0 is critically damped.
 *
 * The rule we follow: no overshoot by default, and bounce only where the
 * gesture itself carried momentum. A menu that just faded in should not
 * wobble; a sheet the user flicked away should.
 */

export const spring = {
  /** Repositioning something on screen. Apple: damping 1.0, response 0.4. */
  move: { type: "spring", bounce: 0, duration: 0.4 },

  /** Sheets and drawers — the user throws these. Apple: damping 0.8, response 0.3. */
  sheet: { type: "spring", bounce: 0.2, duration: 0.34 },

  /** Short acknowledgement: a bar appearing, a chip settling. */
  snap: { type: "spring", bounce: 0, duration: 0.26 },
} as const;

/** Cross-fade used in place of movement when reduced motion is requested. */
export const reducedFade = { duration: 0.18, ease: "easeOut" } as const;

/**
 * Where a flick would come to rest, using the same exponential decay as
 * scroll deceleration. Snapping from the release point ignores how hard the
 * user threw it; projecting forward is what makes a flick feel like a throw.
 *
 * From Apple's "Designing Fluid Interfaces" sample code.
 */
export function projectDecay(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
