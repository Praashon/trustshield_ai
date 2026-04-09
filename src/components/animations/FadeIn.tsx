'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const offsets = {
      up: { y: 30, x: 0 },
      down: { y: -30, x: 0 },
      left: { y: 0, x: 30 },
      right: { y: 0, x: -30 },
      none: { y: 0, x: 0 },
    };

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        y: offsets[direction].y,
        x: offsets[direction].x,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease: 'power3.out',
      }
    );
  }, [direction, delay, duration]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
