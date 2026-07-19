"use client";

import { useEffect, useRef } from "react";

// A small "glass box" outline that trails the real cursor, plus a tight dot
// riding exactly on it -- the GlassBox motif, literally following you around.
// Purely decorative: pointer-events-none, and skipped entirely on touch
// devices where there's no persistent cursor to attach to.
export default function CursorGlass() {
  const dotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("cursor-glass-active");

    let mouseX = -100;
    let mouseY = -100;
    let boxX = -100;
    let boxY = -100;
    let rafId: number;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    }

    function tick() {
      boxX += (mouseX - boxX) * 0.12;
      boxY += (mouseY - boxY) * 0.12;
      if (boxRef.current) {
        boxRef.current.style.transform = `translate3d(${boxX}px, ${boxY}px, 0) translate(-50%, -50%) rotate(${(mouseX - boxX) * 0.6}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("cursor-glass-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-100 h-1.5 w-1.5 rounded-full bg-accent opacity-0 transition-opacity duration-300 in-[.cursor-glass-active]:opacity-100"
      />
      <div
        ref={boxRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-100 h-7 w-7 rounded-sm border border-accent/50 opacity-0 transition-opacity duration-300 in-[.cursor-glass-active]:opacity-100"
      />
    </>
  );
}
