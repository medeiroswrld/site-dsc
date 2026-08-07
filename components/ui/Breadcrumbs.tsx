import Link from "next/link";
import type { Crumb } from "@/lib/seo";

/**
 * The last crumb is the current page and is not a link. Everything before it
 * navigates.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Você está em">
      <ol className="plate flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-fg-subtle">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;

          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-fg">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="-my-2 inline-block py-2 underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline"
                >
                  {crumb.name}
                </Link>
              )}
              {!last && (
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
