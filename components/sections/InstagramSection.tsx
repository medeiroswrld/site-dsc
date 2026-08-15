import { Reveal } from "@/components/motion/Reveal";
import { InstagramCarousel } from "@/components/sections/InstagramCarousel";
import { Instagram } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { getInstagramPosts } from "@/lib/instagram-repository";
import { siteConfig } from "@/lib/site";
import { getStoreInfo } from "@/lib/site-content-repository";

/**
 * Proof that the shop is active, without an embed.
 *
 * The official widget ships a third-party script, breaks when a post is
 * deleted and cannot be styled. The photos here are uploaded through the panel
 * at /admin/instagram, so the section is as fast and as reliable as the rest of
 * the site.
 */
export async function InstagramSection() {
  const [posts, store] = await Promise.all([getInstagramPosts(), getStoreInfo()]);
  if (!posts.length) return null;

  return (
    <section className="bg-bg py-14 lg:py-18" aria-labelledby="instagram-titulo">
      <Container size="wide">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className="eyebrow">Instagram</p>
            <h2 id="instagram-titulo" className="display-3 mt-4">
              Acompanhe a D.S.C. no Instagram
            </h2>
          </div>

          <UnderlineLink
            href={store.instagramUrl}
            external
            leading={<Instagram className="text-[1.0625rem]" />}
          >
            {store.instagramHandle}
          </UnderlineLink>
        </Reveal>

        <Reveal className="mt-8">
          <InstagramCarousel posts={posts} />
        </Reveal>

        {/* The carousel is a pointer toy: it drags, it autoplays, and its cards
            carry aria-hidden. This list is the same posts as plain links, so
            keyboard and screen-reader users are not sent to a dead end. */}
        <ul className="sr-only">
          {posts.map((post, index) => (
            <li key={post.id}>
              <a href={post.href} target="_blank" rel="noopener noreferrer">
                Ver publicação {index + 1} no Instagram da {siteConfig.name}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
