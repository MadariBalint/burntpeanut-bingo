import { useState } from "react";

export function useCopyFeedback(onError) {
  const [copiedValue, setCopiedValue] = useState("");

  async function copyValue(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);

      window.setTimeout(() => {
        setCopiedValue("");
      }, 2000);
    } catch {
      onError("Could not copy the Game ID.");
    }
  }

  return {
    copiedValue,
    copyValue,
    resetCopiedValue: () => setCopiedValue(""),
  };
}
