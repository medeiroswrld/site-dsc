/**
 * Hand-rolled icon set. A whole icon library would be the largest dependency
 * on the site for the twelve glyphs it actually uses.
 *
 * All icons inherit `currentColor` and are decorative by default — the label
 * always lives in the surrounding button or link text.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Icon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function Close(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function Search(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function Sliders(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </Icon>
  );
}

export function Phone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3 13.1 10.9 21 19.4 21a1.5 1.5 0 0 0 1.6-1.5v-2a1 1 0 0 0-.8-1l-3.3-.7a1 1 0 0 0-1 .4l-.9 1.2a13.4 13.4 0 0 1-5.7-5.7l1.2-.9a1 1 0 0 0 .4-1l-.7-3.3a1 1 0 0 0-1-.8Z" />
    </Icon>
  );
}

export function MapPin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 10c0 5.2-7 11-7 11s-7-5.8-7-11a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  );
}

export function Instagram(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </Icon>
  );
}

export function WhatsApp(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.16-1.35a9.9 9.9 0 0 0 4.88 1.27h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm0 18.17h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.24 8.24 0 1 1 15.24-4.36 8.26 8.26 0 0 1-8.28 8.21Zm4.5-6.15c-.24-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.56.12s-.64.8-.79.97c-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-1.98-1.22 7.5 7.5 0 0 1-1.37-1.7c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.24-.42.08-.16.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.18 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.18-.06-.11-.22-.17-.46-.29Z" />
    </svg>
  );
}

export function Star({
  /** 0–1 portion of the star that should read as filled. */
  fill = 1,
  ...props
}: Omit<IconProps, "fill"> & { fill?: number }) {
  const id = `star-${Math.round(fill * 100)}`;
  const d =
    "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z";

  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {fill > 0 && fill < 1 && (
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset={fill} stopColor="currentColor" />
            <stop offset={fill} stopColor="currentColor" stopOpacity="0.22" />
          </linearGradient>
        </defs>
      )}
      <path
        d={d}
        fill={
          fill >= 1
            ? "currentColor"
            : fill <= 0
              ? "currentColor"
              : `url(#${id})`
        }
        fillOpacity={fill <= 0 ? 0.22 : 1}
      />
    </svg>
  );
}

export function Expand(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
    </Icon>
  );
}

export function Play(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l11-6.8a.8.8 0 0 0 0-1.36l-11-6.8A.8.8 0 0 0 8 5.2Z" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}
