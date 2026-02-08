"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type TypingOnceProps = {
  text: string;
  speed?: number;
  className?: string;
};

export default function TypingOnce({
  text,
  speed = 85,
  className,
}: TypingOnceProps) {
  const [count, setCount] = useState(0);

  const finished = count >= text.length;

  useEffect(() => {
    if (finished) return;

    const t = setTimeout(() => {
      setCount((c) => c + 1);
    }, speed);

    return () => clearTimeout(t);
  }, [count, finished, speed]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {text.slice(0, count)}

      {/* typing cursor */}
      {!finished && <Cursor />}

      {/* blinking dot after finish */}
      {finished && <BlinkingDot />}
    </motion.span>
  );
}

function Cursor() {
  return (
    <motion.span
      className="ml-1 inline-block align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
      style={{
        width: "1px",
        height: "1.2em",
        backgroundColor: "currentColor",
      }}
    />
  );
}

function BlinkingDot() {
  return (
    <motion.span
      className="ml-1 inline-block"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      .
    </motion.span>
  );
}
