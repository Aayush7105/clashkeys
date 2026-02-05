"use client";

import { useState } from "react";

export default function SoloPlay() {
  const text = "This is a simple solo typing test for the prototype.";
  const [typed, setTyped] = useState("");

  let correctLength = 0;
  for (let i = 0; i < typed.length && i < text.length; i += 1) {
    if (typed[i] !== text[i]) break;
    correctLength += 1;
  }

  const progress = Math.min(
    Math.round((correctLength / text.length) * 100),
    100
  );

  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <h2>Solo Play</h2>

      <div style={{ marginTop: 20 }}>
        <b>Typing text</b>
        <p>{text}</p>
      </div>

      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="Start typing..."
        style={{ width: "100%", padding: 8 }}
      />

      <div style={{ marginTop: 20 }}>
        <div>Progress: {progress}%</div>
        <div
          style={{
            height: 8,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#10b981",
            }}
          />
        </div>
      </div>
    </div>
  );
}
