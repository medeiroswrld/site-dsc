"use client";

import DepthCarousel from "@/components/reactbits/DepthCarousel";
import type { InstagramPost } from "@/lib/instagram-repository";
import { siteConfig } from "@/lib/site";

/**
 * Client wrapper around the React Bits carousel.
 *
 * Two things the raw component does not do on its own, both handled here:
 * clicking the card in front opens the post, and the wheel is left alone so
 * scrolling past this section does not get trapped cycling slides.
 */
export function InstagramCarousel({ posts }: { posts: InstagramPost[] }) {
  return (
    // The stack fans to the right and its scale only shrinks so far, so on a
    // narrow phone the rearmost cards run past the viewport. Clipping here
    // keeps the page from gaining a horizontal scrollbar.
    <div className="relative h-[26rem] overflow-hidden sm:h-[30rem] lg:h-[34rem]">
      <DepthCarousel
        items={posts}
        cardWidth={300}
        cardHeight={300}
        radius={16}
        tint="var(--color-bg)"
        depth={200}
        spread={86}
        tilt={20}
        tiltDirection="right"
        perspective={1300}
        visibleCards={4}
        // Gentler than the default: the store's photos are already dark, and
        // a steep falloff sinks the back of the stack into the background.
        falloff={0.15}
        blur={4}
        duration={620}
        ease="power3.out"
        autoplay
        autoplayDelay={3600}
        loop
        showControls
        showIndicators
        // The page has to keep scrolling under the pointer. Upstream calls
        // preventDefault on wheel, which strands a visitor mid-page.
        wheelNavigation={false}
        onItemActivate={(_index: number, item: InstagramPost) => {
          window.open(
            item?.href ?? siteConfig.instagram.url,
            "_blank",
            "noopener,noreferrer",
          );
        }}
      />
    </div>
  );
}
