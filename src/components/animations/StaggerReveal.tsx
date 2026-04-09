'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StaggerRevealProps {
  children: React.ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

export function StaggerReveal({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  className = '',
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.children;

    gsap.fromTo(
      elements,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger: staggerDelay,
        ease: 'power2.out',
      }
    );
  }, [staggerDelay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
