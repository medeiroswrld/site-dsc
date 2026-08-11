import { HeaderOffset } from "@/components/layout/Header";
import { Container } from "@/components/ui/Container";

/** Streaming fallback for /estoque. Mirrors the real layout's proportions. */
export default function StockLoading() {
  return (
    <>
      <HeaderOffset />
      <Container size="wide" className="pb-24 pt-10 lg:pt-16">
        <div className="animate-pulse">
          <div className="h-3 w-20 bg-surface-2" />
          <div className="mt-5 h-11 w-full max-w-xl bg-surface-2" />
          <div className="mt-4 h-4 w-full max-w-md bg-surface-2" />
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-12 xl:gap-x-14">
          <div className="hidden animate-pulse space-y-5 lg:col-span-3 lg:block">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-2.5 w-16 bg-surface-2" />
                <div className="h-11 w-full bg-surface-2" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-9">
            <div className="h-13 w-full animate-pulse bg-surface-2" />
            <ul className="mt-9 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <li key={index} className="animate-pulse">
                  <div className="aspect-[4/2.7] w-full bg-surface-2" />
                  <div className="mt-4 h-2.5 w-16 bg-surface-2" />
                  <div className="mt-3 h-4 w-3/4 bg-surface-2" />
                  <div className="mt-4 h-10 w-full bg-surface-2" />
                  <div className="mt-4 h-5 w-28 bg-surface-2" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </>
  );
}
