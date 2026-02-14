"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

export default function TiffyValentinePage() {
  const [noClicked, setNoClicked] = useState(false);
  const [yesClicked, setYesClicked] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noClickCount, setNoClickCount] = useState(0);
  const booAudioRef = useRef<HTMLAudioElement | null>(null);
  const yayAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    booAudioRef.current = new Audio("/valentine-assets/boo.mp3");
    yayAudioRef.current = new Audio("/valentine-assets/yay.mp3");
  }, []);

  const handleYesClick = () => {
    setYesClicked(true);

    // Play celebration sound
    if (yayAudioRef.current) {
      yayAudioRef.current.play();
    }

    // Fire confetti
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ["#ff69b4", "#ff1493", "#ff6b6b", "#ffd700", "#ff85a2"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();

    // Also burst hearts from center
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ["circle"],
    });
  };

  const handleNoClick = () => {
    setNoClicked(true);
    setNoClickCount((prev) => prev + 1);

    // Play boo sound
    if (booAudioRef.current) {
      booAudioRef.current.currentTime = 0;
      booAudioRef.current.play();
    }

    // Move button to random position
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxX = containerRect.width - 150;
      const maxY = containerRect.height - 60;
      const newX = Math.random() * maxX - maxX / 2;
      const newY = Math.random() * maxY - maxY / 2;
      setNoPosition({ x: newX, y: newY });
    }
  };

  if (yesClicked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="text-center animate-bounce-slow">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            YAAAY! 🎉💕
          </h1>
          <p className="text-2xl md:text-3xl text-pink-200 mb-8">
            I knew you&apos;d say yes, My Tiffy Tuffy!
          </p>
          <div className="text-8xl animate-pulse">💖</div>
          <p className="text-xl text-pink-100 mt-8 max-w-md mx-auto">
            You&apos;ve made me the happiest person in the world!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10"
    >
      <div className="text-center max-w-lg mx-auto">
        {/* Puss in Boots Image */}
        <div className="relative w-64 h-48 md:w-96 md:h-72 mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-pink-300/50 bg-black/20 backdrop-blur-sm">
          <Image
            src="/valentine-assets/final-img.jpg"
            alt="Puss in Boots with pleading eyes"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Valentine Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          My Tiffy Tuffy
        </h1>
        <p className="text-xl md:text-2xl text-pink-200 mb-8 leading-relaxed">
          Will you be my Valentine? 💕
        </p>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
          {/* YES Button */}
          <button
            onClick={handleYesClick}
            className="px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 hover:from-green-400 hover:to-emerald-500 active:scale-95"
          >
            YES! 💚
          </button>

          {/* NO Button */}
          <button
            onClick={handleNoClick}
            className="px-12 py-4 text-xl font-bold text-pink-200 bg-transparent border-2 border-pink-300/50 rounded-full hover:border-pink-300 transition-all duration-500 active:scale-95"
            style={{
              transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
            }}
          >
            {noClicked ? (
              <span className="flex items-center gap-2">Oops!!!👎</span>
            ) : (
              "No"
            )}
          </button>
        </div>

        {/* Message after clicking no */}
        {noClickCount > 0 && (
          <p className="text-pink-200 mt-6 animate-pulse">
            {noClickCount === 1 && "Are you sure? Look at those eyes! 🥺"}
            {noClickCount === 2 && "Please reconsider! 💔"}
            {noClickCount === 3 && "You're breaking my heart! 😢"}
            {noClickCount >= 4 && "Just click YES already! 😭💕"}
          </p>
        )}
      </div>
    </div>
  );
}
