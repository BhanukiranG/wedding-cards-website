"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  type: number;
}

export default function FloatingPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate petals
    const newPetals = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      delay: Math.random() * -20, // pre-fill screen
      duration: Math.random() * 12 + 10, // speed
      size: Math.random() * 16 + 10, // size
      rotation: Math.random() * 360,
      type: Math.floor(Math.random() * 3), // type of petal
    }));
    setPetals(newPetals);
  }, []);

  // SVG vectors
  const petalSVGs = [
    // Deep red rose
    "M12,2 C15,6 20,8 19,13 C18,17 14,21 11,21 C7,20 4,16 5,12 C6,8 9,3 12,2 Z",
    // Bright red rose
    "M12,4 C14,8 18,10 17,14 C16,17 13,19 10,19 C7,18 5,15 6,12 C7,9 10,5 12,4 Z",
    // Jasmine petal
    "M12,2 C13.5,6.5 17,8 17,11 C17,14 14,17 11.5,17 C9,17 6.5,14 6.5,11 C6.5,8 10.5,6.5 12,2 Z"
  ];

  const colors = ["#C0392B", "#E74C3C", "#FAF6EB"];
  const strokes = ["transparent", "transparent", "#FAF3C0"];

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {petals.map((petal) => (
        <motion.svg
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            width: petal.size,
            height: petal.size,
            y: "-10%"
          }}
          initial={{ y: "-10%", x: "0%", rotate: petal.rotation, opacity: 0 }}
          animate={{
            y: "110vh",
            x: ["0%", "5%", "-5%", "3%", "0%"],
            rotate: [petal.rotation, petal.rotation + 180, petal.rotation + 360],
            opacity: [0, 0.9, 0.9, 0.9, 0]
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: "linear"
          }}
          viewBox="0 0 24 24"
        >
          <path
            d={petalSVGs[petal.type]}
            fill={colors[petal.type]}
            stroke={strokes[petal.type]}
            strokeWidth={petal.type === 2 ? 0.5 : 0}
          />
        </motion.svg>
      ))}
    </div>
  );
}
