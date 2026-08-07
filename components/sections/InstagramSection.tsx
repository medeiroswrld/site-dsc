import Image from "next/image";
import { MediaReveal, Reveal } from "@/components/motion/Reveal";
import { Instagram } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { siteConfig } from "@/lib/site";

/**
 * A static grid built from the store's own posts rather than an embed. The
 * official widget ships a third-party script, breaks when a post is deleted
 * and cannot be styled — none of which is worth it for a proof-of-activity
 * strip.
 *
 * ASSET NEEDED: six recent images from @dsc_seminovos, saved to
 * /public/social/ and listed below with the post URL each one links to.
 */
const posts = Array.from({ length: 6 }, (_, index) => ({
  src: `/placeholders/social-0${index + 1}.svg`,
  alt: "Espaço reservado para uma publicação do Instagram da D.S.C. Seminovos",
  href: siteConfig.instagram.url,
  label: `Ver publicação ${index + 1} no Instagram da D.S.C. Seminovos`,
}));

export function InstagramSection() {
  return (
    <section className="bg-bg py-20 lg:py-24" aria-labelledby="instagram-titulo">
      <Container size="wide">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className="eyebrow">Instagram</p>
            <h2 id="instagram-titulo" className="display-3 mt-4">
              Acompanhe a D.S.C. no Instagram
            </h2>
          </div>

          <UnderlineLink
            href={siteConfig.instagram.url}
            external
            leading={<Instagram className="text-[1.0625rem]" />}
          >
            {siteConfig.instagram.handle}
          </UnderlineLink>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {posts.map((post, index) => (
            <li key={post.src}>
              <a
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={post.label}
                className="group block"
              >
                <MediaReveal
                  delay={index * 0.05}
                  className="relative aspect-square rounded-xl bg-surface-2"
                >
                  <Image
                    src={post.src}
                    alt={post.alt}
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 31vw, 46vw"
                    className="object-cover transition-transform duration-[600ms] ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
                  />
                </MediaReveal>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
