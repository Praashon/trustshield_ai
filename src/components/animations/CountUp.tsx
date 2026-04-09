'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 1.5,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const objRef = useRef({ value: 0 });

  useEffect(() => {
    gsap.to(objRef.current, {
      value: end,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplay(Math.round(objRef.current.value));
      },
    });
  }, [end, duration, delay]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
