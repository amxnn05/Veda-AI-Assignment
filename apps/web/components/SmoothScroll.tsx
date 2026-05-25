'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.05, 
      duration: 1.2, 
      smoothWheel: true,
      wheelMultiplier: 1, 
      touchMultiplier: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium easing
    }}>
      {children}
    </ReactLenis>
  );
}
