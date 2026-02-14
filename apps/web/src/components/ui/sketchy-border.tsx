'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface SketchyBorderProps {
  children: ReactNode;
  className?: string;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  seed?: number;
}

export function SketchyBorder({
  children,
  className = '',
  roughness = 1.0,
  stroke = 'var(--notebook-ink-light)',
  strokeWidth = 1.5,
  fill,
  seed,
}: SketchyBorderProps) {
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
        const padding = strokeWidth;

        // Clear previous paths
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }

        const rect = rc.rectangle(
          padding,
          padding,
          width - padding * 2,
          height - padding * 2,
          {
            roughness,
            stroke,
            strokeWidth,
            fill: fill || 'none',
            fillStyle: fill ? 'solid' : undefined,
            seed: seed ?? Math.floor(Math.random() * 2 ** 31),
          }
        );

        svgRef.current.appendChild(rect);
        setLoaded(true);
      } catch {
        // Fallback: roughjs failed to load — CSS border used instead
        setLoaded(false);
      }
    })();

    return () => { cancelled = true; };
  }, [dimensions, roughness, stroke, strokeWidth, fill, seed]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={!loaded ? { borderRadius: '4px', border: `${strokeWidth}px solid ${stroke}` } : undefined}
    >
      {loaded && (
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
