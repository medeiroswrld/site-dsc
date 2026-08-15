/**
 * Types for the JavaScript component next door. Declaring them here keeps
 * DepthCarousel.jsx close to upstream while the rest of this codebase stays
 * type-checked.
 */
export interface DepthCarouselItem {
  image: string;
  alt?: string;
  /** Not used by the component itself — carried through to `onItemActivate`. */
  href?: string;
}

export interface DepthCarouselProps<T extends DepthCarouselItem = DepthCarouselItem> {
  items?: Array<string | T>;
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  /** Room kept beside the fan before the stage is scaled down to fit. */
  fitPadding?: number;
  tilt?: number;
  tiltDirection?: "left" | "right";
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: T) => void;
  /** Local addition: false leaves the page's own scrolling alone. */
  wheelNavigation?: boolean;
  /** Local addition: fires when the card already in front is clicked. */
  onItemActivate?: (index: number, item: T) => void;
  className?: string;
}

declare function DepthCarousel<T extends DepthCarouselItem = DepthCarouselItem>(
  props: DepthCarouselProps<T>,
): JSX.Element;

export default DepthCarousel;
