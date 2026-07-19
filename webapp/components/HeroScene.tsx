"use client";

import dynamic from "next/dynamic";

// Three.js is real weight -- loaded client-side only, after the hero's text
// has already painted from SSR'd HTML. The aurora glow behind it is visible
// immediately so there's no empty gap while the WebGL bundle streams in.
const GlassCube = dynamic(() => import("./GlassCube"), { ssr: false });

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <GlassCube />
    </div>
  );
}
