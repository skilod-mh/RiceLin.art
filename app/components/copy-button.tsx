"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      alert("Clipboard access failed. Select and copy the command manually.");
    }
  }

  return <button className="btn-secondary" type="button" onClick={copy} aria-label="Copy command">{copied ? "Copied!" : "Copy command"}</button>;
}
