"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { InstagramPost } from "@/lib/instagram-repository";
import { useStore } from "@/components/layout/StoreProvider";

/**
 * The carousel is the only thing in the project that needs GSAP, and it sits
 * at the very bottom of the home page. Loading it with the page meant every
 * visitor downloaded an animation engine to see a strip of photos most of them
 * never scroll to. Now it arrives only once the section is close to the
 * viewport — off the critical path entirely.
 */
// The cast restores the generic signature, which `dynamic()` erases — without
// it `onItemActivate` would hand back the base item type instead of the post.
const DepthCarousel = dynamic(() => import("@/components/reactbits/DepthCarousel"), {
  ssr: false,
}) as typeof import("@/components/reactbits/DepthCarousel").default;

/**
 * Client wrapper around the React Bits carousel.
 *
 * Three things the raw component does not do on its own: clicking the card in
 * front opens the post, the wheel is left alone so scrolling past this section
 * does not get trapped cycling slides, and the cards are sized from the space
 * actually available.
 *
 * That last one matters more than it sounds. The carousel scales the whole
 * stage down whenever its container is narrower than
 * `cardWidth + spread * 2 + fitPadding`. With the old fixed 300px card that
 * threshold was 592px, so every phone fell under it and drew the cards at
 * roughly 180px — half the screen given to empty black. Measuring first and
 * sizing the card to what actually fits keeps that scale at 1, which is the
 * difference between a thumbnail and a photograph.
 */
export function InstagramCarousel({ posts }: { posts: InstagramPost[] }) {
  const store = useStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const sizeObserver = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    sizeObserver.observe(frame);

    // 400px of margin: the chunk starts downloading while the section is still
    // below the fold, so it is ready by the time it is actually on screen.
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    nearObserver.observe(frame);

    return () => {
      sizeObserver.disconnect();
      nearObserver.disconnect();
    };
  }, []);

  // A phone gets a tighter fan and almost no side allowance: every pixel spent
  // on the stack behind is a pixel taken from the photo in front.
  const narrow = width > 0 && width < 640;
  const spread = narrow ? 32 : 86;
  const fitPadding = narrow ? 16 : 120;

  const available = width - spread * 2 - fitPadding;
  const card = Math.round(Math.min(Math.max(available, 220), narrow ? 340 : 460));

  // The height follows the card, so the section no longer leaves the band of
  // empty black under the stack that the fixed heights produced on desktop.
  const height = card + (narrow ? 84 : 128);

  return (
    // The stack fans to the right, and on a narrow screen the rearmost cards
    // still run past the frame. Clipping here keeps the page from gaining a
    // horizontal scrollbar.
    <div
      ref={frameRef}
      className="relative overflow-hidden"
      style={{ height: width > 0 ? `${height}px` : "26rem" }}
    >
      {width > 0 && near && (
        <DepthCarousel
          items={posts}
          cardWidth={card}
          cardHeight={card}
          radius={16}
          tint="var(--color-bg)"
          depth={narrow ? 150 : 200}
          spread={spread}
          fitPadding={fitPadding}
          tilt={narrow ? 14 : 20}
          tiltDirection="right"
          perspective={1300}
          visibleCards={narrow ? 3 : 4}
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
              item?.href ?? store.instagramUrl,
              "_blank",
              "noopener,noreferrer",
            );
          }}
        />
      )}
    </div>
  );
}
