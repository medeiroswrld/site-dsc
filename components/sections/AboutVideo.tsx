"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The store's film, embedded from Vimeo with the player chrome switched off.
 *
 * Two decisions worth knowing about.
 *
 * The iframe is not in the page until the section comes near the viewport. An
 * embed is a whole second document — player, network requests, its own
 * JavaScript — and this one sits well below the fold. Mounting it on load
 * would undo the work done to get the home page light.
 *
 * The player is driven by `postMessage` rather than Vimeo's SDK. The SDK is
 * about 90 kB to do what four one-line messages already do, and it would have
 * to load before the first click could work. Vimeo documents this message API,
 * and it needs nothing on our side.
 *
 * `controls=0` removes the whole bar — scrubber, fullscreen, quality, Vimeo
 * logo. What is left is what the shop asked for: click to play, and sound.
 */
const VIDEO_ID = "1218889963";

const PLAYER_SRC =
  `https://player.vimeo.com/video/${VIDEO_ID}` +
  "?title=0&byline=0&portrait=0&badge=0&controls=0&autopause=0" +
  // dnt keeps Vimeo from setting tracking cookies on the visitor.
  "&dnt=1&pip=0&keyboard=0&transparent=0";

export function AboutVideo({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Vimeo reports back over the same channel, so the button state follows the
  // player instead of guessing — including when the video reaches the end.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!event.origin.includes("vimeo.com")) return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "play") setPlaying(true);
        if (data?.event === "pause" || data?.event === "ended") setPlaying(false);
        if (data?.event === "ready") {
          send("addEventListener", "play");
          send("addEventListener", "pause");
          send("addEventListener", "ended");
        }
      } catch {
        // A frame that sends something we cannot read is not our problem.
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function send(method: string, value?: unknown) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify(value === undefined ? { method } : { method, value }),
      "https://player.vimeo.com",
    );
  }

  function toggle() {
    send(playing ? "pause" : "play");
  }

  function toggleMuted() {
    const next = !muted;
    setMuted(next);
    send("setMuted", next);
  }

  return (
    <div
      ref={frameRef}
      className={cn("relative overflow-hidden bg-surface-2", className)}
    >
      {near && (
        <iframe
          ref={iframeRef}
          src={PLAYER_SRC}
          title="Vídeo da D.S.C. Seminovos"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      )}

      {/* The click target sits over the player because `controls=0` leaves the
          iframe with no affordance of its own. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar o vídeo" : "Reproduzir o vídeo"}
        className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-fg"
      >
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-bg/70 text-fg backdrop-blur-md transition-all duration-300",
            playing ? "scale-90 opacity-0" : "scale-100 opacity-100",
          )}
        >
          <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </span>
      </button>

      {/* Only appears once there is something to hear. */}
      {playing && (
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Ativar o som" : "Desativar o som"}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg/70 text-fg backdrop-blur-md transition-colors hover:bg-bg/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
            {muted ? (
              <path
                d="M16 9l4 6M20 9l-4 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M16.5 8.5a5 5 0 010 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}
