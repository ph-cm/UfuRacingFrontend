'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  RefObject,
  CSSProperties,
} from 'react';
import './LogoLoop.css';

type LogoItemImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  href?: string;
};

type LogoItemNode = {
  node: React.ReactNode;
  ariaLabel?: string;
  title?: string;
  href?: string;
};

export type LogoLoopItem = LogoItemImage | LogoItemNode;

interface LogoLoopProps {
  logos: LogoLoopItem[];
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: string | number;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoLoopItem, key: string | number) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
};

const toCssLength = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const useResizeObserver = (
  callback: () => void,
  elements: Array<RefObject<HTMLElement | null>>,
  dependencies: unknown[]
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener("resize", handleResize);
      callback();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, dependencies);
};

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | HTMLDivElement | null>,
  onLoad: () => void,
  deps: any[]
) => {
  useEffect(() => {
    const root = seqRef.current;
    const images = root?.querySelectorAll("img") ?? [];

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remaining = images.length;

    const resolve = () => {
      remaining -= 1;
      if (remaining === 0) onLoad();
    };

    images.forEach((img) => {
      if (img.complete) resolve();
      else {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", resolve);
        img.removeEventListener("error", resolve);
      });
    };
  }, deps);
};


const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const offset = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const seqSize = isVertical ? seqHeight : seqWidth;

    const loop = (timestamp: number) => {
      if (lastTime.current == null) lastTime.current = timestamp;
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      const easing = 1 - Math.exp(-dt / 0.25);

      velocity.current += (target - velocity.current) * easing;
      offset.current = (offset.current + velocity.current * dt + seqSize) % seqSize;

      track.style.transform = isVertical
        ? `translate3d(0, ${-offset.current}px, 0)`
        : `translate3d(${-offset.current}px, 0, 0)`;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTime.current = null;
    };
  }, [trackRef, targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]);
};

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [hovered, setHovered] = useState(false);

  const isVertical = direction === 'up' || direction === 'down';

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    return undefined;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const base = Math.abs(speed);
    const dir = isVertical
      ? direction === 'up'
        ? 1
        : -1
      : direction === 'left'
      ? 1
      : -1;

    return base * dir;
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerW = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect?.();
    const seqW = rect?.width ?? 0;
    const seqH = rect?.height ?? 0;

    if (isVertical) {
      if (seqH > 0) {
        setSeqHeight(Math.ceil(seqH));
        const viewport = containerRef.current?.clientHeight ?? seqH;
        const copies = Math.ceil(viewport / seqH) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copies));
      }
    } else {
      if (seqW > 0) {
        setSeqWidth(Math.ceil(seqW));
        const copies = Math.ceil(containerW / seqW) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copies));
      }
    }
  }, [isVertical]);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);

  useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, hovered, effectiveHoverSpeed, isVertical);

  const cssVars: CSSProperties = {
    '--logoloop-gap': `${gap}px`,
    '--logoloop-logoHeight': `${logoHeight}px`,
    ...(fadeOutColor ? { '--logoloop-fadeColor': fadeOutColor } : {}),
  } as CSSProperties;

  const handleEnter = () => effectiveHoverSpeed !== undefined && setHovered(true);
  const handleLeave = () => effectiveHoverSpeed !== undefined && setHovered(false);

  const lists = Array.from({ length: copyCount }).map((_, copyIndex) => (
  <ul
    key={copyIndex}
    className="logoloop__list"
    aria-hidden={copyIndex > 0}
    ref={copyIndex === 0 ? seqRef : undefined}
  >
    {logos.map((item, i) => {
      const key = `${copyIndex}-${i}`;

      // 1. Retorno para o caso de renderItem customizado
      if (renderItem) {
        return (
          <li key={key} className="logoloop__item">
            {renderItem(item, key)}
          </li>
        );
      }

      const isNode = (item as any).node !== undefined;
const src = (item as any).src;

return (
  <li key={key} className="logoloop__item">
    {isNode ? (
      <span className="logoloop__node">{(item as any).node}</span>
    ) : src ? (
      <img
        {...(item as any)}
        alt={(item as any).alt ?? ""}
        loading="lazy"
        style={{
          height: "var(--logoloop-logoHeight)",
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
        onError={(e) => {
          // fallback VISÍVEL
          e.currentTarget.style.display = "none";
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.textContent = (item as any).alt ?? "";
            (parent as HTMLElement).style.fontWeight = "800";
            (parent as HTMLElement).style.color = "#041E3F"; // visível no branco
          }
        }}
      />
    ) : (
      <span style={{ fontWeight: 800, color: "#041E3F" }}>
        {(item as any).alt ?? ""}
      </span>
    )}
  </li>
);
    })}
  </ul>
));

  return (
    <div
      ref={containerRef}
      className={['logoloop', isVertical ? 'logoloop--vertical' : 'logoloop--horizontal', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: !isVertical ? toCssLength(width) : undefined,
        ...cssVars,
        ...style,
      }}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        className="logoloop__track"
        ref={trackRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {lists}
      </div>
    </div>
  );
});

export default LogoLoop;