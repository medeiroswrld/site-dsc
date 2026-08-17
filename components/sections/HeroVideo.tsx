"use client";

import Image from "next/image";
import type { ResolvedMedia } from "@/lib/site-content";
import { isVectorSource } from "@/lib/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Play, WhatsApp } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { useStore } from "@/components/layout/StoreProvider";
import { FoldHeading } from "@/components/motion/FoldHeading";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * ASSET NEEDED — the store's presentation film.
 *   /public/media/hero.mp4   (H.264, ~1920×1080, no audio track, 12–25 s loop)
 *   /public/media/hero.webm  (optional VP9/AV1 sibling, smaller on Chrome)
 *   /public/media/hero-poster.jpg (first frame, ~1920×1080, compressed)
 *
 * Until those exist the poster placeholder below carries the layout, and the
 * <video> element removes itself the moment the source fails to load — no
 * broken frame, no layout shift.
 */
export function HeroVideo({
  poster,
  video,
}: {
  /** Still frame behind the headline. Always present. */
  poster: ResolvedMedia;
  /** The store film, when one has been uploaded. */
  video: ResolvedMedia | null;
}) {
  const store = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // The video mounts after first paint so it never competes with the LCP text.
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);
  const [showCue, setShowCue] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  const shouldAutoplay = !reduced;
  const showVideo =
    Boolean(video) && (shouldAutoplay || manualPlay) && !videoFailed;

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVideoReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // The scroll cue waits until the film has had time to establish itself.
  useEffect(() => {
    const id = window.setTimeout(() => setShowCue(true), reduced ? 600 : 3400);
    return () => window.clearTimeout(id);
  }, [reduced]);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // The film recedes as the stock section takes over: a short lift, a slight
  // settle in scale, and a scrim that deepens. Nothing that reads as parallax.
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.55]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[88svh] min-h-[34rem] w-full flex-col justify-end overflow-hidden bg-bg lg:h-[92svh] lg:min-h-[40rem]"
      aria-label={`${siteConfig.name} — apresentação da loja`}
    >
      <motion.div
        className="absolute inset-0"
        style={
          reduced ? undefined : { y: mediaY, scale: mediaScale, willChange: "transform" }
        }
      >
        <Image
          src={poster.src}
          alt=""
          fill
          priority
          unoptimized={poster.isPlaceholder || isVectorSource(poster.src)}
          sizes="100vw"
          className="object-cover"
        />

        {videoReady && showVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster.src}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
            tabIndex={-1}
          >
            {video && <source src={video.src} />}
          </video>
        )}
      </motion.div>

      {/* Legibility treatment. Two gradients, not a flat wash, so the footage
          keeps its contrast everywhere the text is not. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/45 via-45% to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/10 to-transparent lg:from-bg/75 lg:via-bg/5 lg:via-55%"
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-bg"
        style={reduced ? { opacity: 0 } : { opacity: scrimOpacity }}
      />

      <motion.div
        className="relative pb-12 pt-24 sm:pb-16 lg:pb-20"
        style={
          reduced ? undefined : { opacity: contentOpacity, y: contentY }
        }
      >
        <Container size="wide">
          <div className="max-w-[42rem]">
            {/*
              Folded per word, not per character. The headline runs to sixty
              characters — at the component's default stagger that would be
              nearly three seconds of cascade on the largest element of the
              page, which reads as a slow site rather than a considered one.
              Eight words land in under a second.
            */}
            <h1 className="font-display font-semibold leading-[0.99] tracking-[-0.035em] text-[clamp(2.125rem,1.15rem+3.6vw,3.875rem)]">
              <FoldHeading text="Carros selecionados, escritório próprio e negociação sem enrolação." />
            </h1>

            <motion.p
              className="mt-6 max-w-[34rem] text-[0.9375rem] leading-relaxed text-fg-muted sm:text-[1rem]"
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.5 }}
            >
              Há {store.foundedYearsText}, a D.S.C. atende{" "}
              {siteConfig.city} e região com seminovos selecionados,
              financiamento e atendimento direto da equipe.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : 0.62 }}
            >
              <a
                href="#estoque"
                className="btn btn-primary btn-lg"
              >
                Ver estoque
              </a>

              <a
                href={whatsappGeneralLink("página inicial")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
              >
                <WhatsApp className="text-[1.125rem]" />
                Falar no WhatsApp
              </a>
            </motion.div>

            {/* Only offered when the visitor has asked for less motion — the
                film then waits for an explicit decision instead of looping. */}
            {Boolean(video) && reduced && !manualPlay && !videoFailed && (
              <button
                type="button"
                onClick={() => setManualPlay(true)}
                className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] text-fg-muted underline underline-offset-4 transition-colors hover:text-fg"
              >
                <Play className="text-[0.75rem]" />
                Reproduzir o vídeo da loja
              </button>
            )}
          </div>
        </Container>
      </motion.div>

      <motion.a
        href="#estoque"
        className="absolute bottom-6 right-5 hidden items-center gap-2.5 text-fg-muted transition-colors duration-200 hover:text-fg lg:right-12 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: showCue && !scrolledPast ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ pointerEvents: showCue && !scrolledPast ? "auto" : "none" }}
        aria-hidden={!showCue || scrolledPast}
        tabIndex={showCue && !scrolledPast ? undefined : -1}
      >
        <span className="plate text-[0.6875rem] uppercase tracking-[0.14em]">
          Veja o que está disponível agora
        </span>
      </motion.a>
    </section>
  );
}
