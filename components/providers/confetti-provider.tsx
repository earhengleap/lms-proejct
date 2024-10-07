"use client";

import { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";
import { useConfettiStore } from "@/hooks/use-confetti-store";

export const ConfettiProvider = () => {
  const confetti = useConfettiStore();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (confetti.isOpen) {
      setShowConfetti(true);

      const timer = setTimeout(() => {
        setShowConfetti(false);
        confetti.onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [confetti]);

  if (!showConfetti) return null;

  return (
    <ReactConfetti
      className="pointer-events-none z-[100]"
      numberOfPieces={500}
      colors={[
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#ffff00",
        "#ff00ff",
        "#00ffff",
      ]}
      recycle={false}
      gravity={0.1}
      initialVelocityX={0.1}
      initialVelocityY={0.1}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};
