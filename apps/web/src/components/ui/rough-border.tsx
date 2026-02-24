'use client';

/**
 * RoughBorder
 * Renders a roughjs-based sketchy SVG border around its children.
 * Adapts to the element's dimensions via ResizeObserver.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface RoughBorderProps {
  children: ReactNode;
  className?: string;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  /** Deterministic seed — omit for random variation on each render */
  seed?: number;
}

export function RoughBorder({
  children,
  className = '',
  roughness = 1.2,
  stroke = 'var(--notebook-ink-light)',
  strokeWidth = 1.5,
  fill,
  seed,
}: RoughBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const rough = await import('roughjs');
        if (cancelled || !svgRef.current) return;

        const rc = rough.default.svg(svgRef.current);
        const { width, height } = dimensions;
        const pad = strokeWidth + 1;

        // Clear previous drawing
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }

        const rect = rc.rectangle(pad, pad, width - pad * 2, height - pad * 2, {
          roughness,
          stroke,
          strokeWidth,
          fill: fill ?? 'none',
          fillStyle: fill ? 'solid' : undefined,
          seed: seed ?? Math.floor(Math.random() * 2 ** 31),
        });

        svgRef.current.appendChild(rect);
        setLoaded(true);
      } catch {
        setLoaded(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dimensions, roughness, stroke, strokeWidth, fill, seed]);

  return (
    <div
      ref={containerRef}
      data-testid="rough-border"
      className={`relative ${className}`}
      style={
        !loaded
          ? {
              /* Organic-feeling fallback — looks intentional while roughjs loads */
              borderRadius: '3px 9px 4px 7px',
              border: `${strokeWidth}px solid ${stroke}`,
              boxShadow: '1px 2px 5px rgba(139, 119, 90, 0.12)',
            }
          : undefined
      }
    >
      {loaded && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 1 }}
          width={dimensions.width}
          height={dimensions.height}
          aria-hidden="true"
        />
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
