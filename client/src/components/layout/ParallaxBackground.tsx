import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import mountainImg from '@/images/mountain.png'; // Update to your actual path

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxBackground() {
  const bgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!bgRef.current) return;

    gsap.to(bgRef.current, {
      y: -10, // Move the background upward as user scrolls
      ease: 'none',
      scrollTrigger: {
        trigger: bgRef.current,
        start: 'top top',  // When top of bgRef hits top of viewport
        end: '300% top', // When the trigger element has scrolled 300% of its height past the top of the viewport
        scrub: true,       // Smoothly link to scroll
        // markers: true,   // Uncomment to debug
      },
    });
  }, []);

  return (
    <div
      ref={bgRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, 
        backgroundImage: `url(${mountainImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
