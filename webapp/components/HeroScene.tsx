"use client";

import dynamic from "next/dynamic";

// Three.js is real weight -- loaded client-side only, after the hero's text
// has already painted from SSR'd HTML. The glow behind it is visible
// immediately so there's no empty gap while the WebGL bundle streams in.
const GlassCube = dynamic(() => import("./GlassCube"), { ssr: false });

export default function HeroScene() {
  return (
    <div className="relative h-[260px] w-[260px] sm:h-[380px] sm:w-[380px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-8 -z-10 rounded-full bg-accent/20 blur-[70px] animate-glow-pulse"
      />
      <GlassCube />
    </div>
  );
}
