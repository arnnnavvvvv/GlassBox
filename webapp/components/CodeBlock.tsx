"use client";

import { useState } from "react";

function renderLine(line: string) {
  const trimmed = line.trimStart();
  const isComment = trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith("→");
  if (isComment) {
    return <span className="text-muted-foreground">{line}</span>;
  }
  return line || " ";
}

export default function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const code = children.trim();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied or unavailable -- fail silently, the code is still selectable
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md border border-border bg-surface-raised px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 pr-16 font-mono text-xs leading-relaxed text-foreground">
        <code>
          {code.split("\n").map((line, i) => (
            <div key={i}>{renderLine(line)}</div>
          ))}
        </code>
      </pre>
    </div>
  );
}
