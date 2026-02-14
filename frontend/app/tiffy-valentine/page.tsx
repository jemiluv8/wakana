"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

const encouragements = [
  "Are you sure? Look at those eyes! 🥺",
  "Please reconsider! 💔",
  "You're breaking my heart! 😢",
  "Just click YES already! 😭💕",
  "I promise to be the best valentine! 🌹",
  "Don't make me beg... okay I'm begging! 🙏",
  "Please my unicorn 🦄",
];

export default function TiffyValentinePage() {
  const [yesClicked, setYesClicked] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noClickCount, setNoClickCount] = useState(0);
  const [showOopsText, setShowOopsText] = useState(false);
  const booAudioRef = useRef<HTMLAudioElement | null>(null);
  const yayAudioRef = useRef<HTMLAudioElement | null>(null);
  const hurrayAudioRef = useRef<HTMLAudioElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    booAudioRef.current = new Audio("/valentine-assets/boo.mp3");
    yayAudioRef.current = new Audio("/valentine-assets/yay.mp3");
    hurrayAudioRef.current = new Audio("/valentine-assets/hurray.mp3");
  }, []);

  const handleYesClick = () => {
    setYesClicked(true);

    // Stop boo sound if playing
    if (booAudioRef.current) {
      booAudioRef.current.pause();
      booAudioRef.current.currentTime = 0;
    }

    // Play hurray sound once immediately
    if (hurrayAudioRef.current) {
      hurrayAudioRef.current.play();
    }

    // Play celebration sound 3 times with 25 second intervals
    const playSound = () => {
      if (yayAudioRef.current) {
        yayAudioRef.current.currentTime = 0;
        yayAudioRef.current.play();
      }
    };
    playSound(); // Play immediately
    setTimeout(playSound, 25000); // Play after 25 seconds
    setTimeout(playSound, 50000); // Play after 50 seconds

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
    setNoClickCount((prev) => prev + 1);
    setShowOopsText(true);

    // Reset oops text after 10 seconds
    setTimeout(() => {
      setShowOopsText(false);
    }, 10000);

    // Play boo sound
    if (booAudioRef.current) {
      booAudioRef.current.currentTime = 0;
      booAudioRef.current.play();
    }

    // Get viewport dimensions for mobile-safe positioning
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = 140;
    const buttonHeight = 56;
    const padding = 20;

    // Calculate safe bounds (keeping button fully visible)
    const maxX = (viewportWidth - buttonWidth) / 2 - padding;
    const maxY = (viewportHeight - buttonHeight) / 2 - padding;

    // Generate random position within safe bounds
    const newX = (Math.random() * 2 - 1) * Math.min(maxX, 150);
    const newY = (Math.random() * 2 - 1) * Math.min(maxY, 200);

    setNoPosition({ x: newX, y: newY });
  };

  if (yesClicked) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
        <div className="text-center animate-bounce-slow">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
            YAAAY! 🎉💕
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-pink-200 mb-6 sm:mb-8 px-4">
            I knew you&apos;d say yes, My Tiffy Tuffy!
          </p>
          <div className="text-6xl sm:text-8xl animate-pulse">💖</div>
          <p className="text-lg sm:text-xl text-pink-100 mt-6 sm:mt-8 max-w-md mx-auto px-4">
            You&apos;ve made me the happiest person in the world!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative z-10 overflow-hidden">
      <div className="text-center w-full max-w-lg mx-auto">
        {/* Puss in Boots Image */}
        <div className="relative w-56 h-44 sm:w-64 sm:h-48 md:w-96 md:h-72 mx-auto mb-6 sm:mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-pink-300/50 bg-black/20 backdrop-blur-sm">
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg px-2">
          My Tiffy Tuffy
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-pink-200 mb-6 sm:mb-8 leading-relaxed px-4">
          Will you be my Valentine? 💕
        </p>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative min-h-[120px]">
          {/* YES Button */}
          <button
            onClick={handleYesClick}
            className="px-10 sm:px-12 py-4 text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 hover:from-green-400 hover:to-emerald-500 touch-manipulation"
          >
            YES! 💚
          </button>

          {/* NO Button */}
          <button
            ref={noButtonRef}
            onClick={handleNoClick}
            className="px-10 sm:px-12 py-4 text-lg sm:text-xl font-bold text-pink-200 bg-transparent border-2 border-pink-300/50 rounded-full hover:border-pink-300 active:scale-95 transition-all duration-500 touch-manipulation select-none"
            style={{
              transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
              zIndex: 50,
            }}
          >
            {showOopsText ? "Oooooopppppsss! 😬" : "No! 😡"}
          </button>
        </div>

        {/* Message after clicking no */}
        {noClickCount > 0 && (
          <p className="text-pink-200 mt-6 animate-pulse text-base sm:text-lg px-4">
            {encouragements[(noClickCount - 1) % encouragements.length]}
          </p>
        )}
      </div>
    </div>
  );
}
