import type { Metadata } from "next";
import { Creepster, Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-handwritten",
});

const creepster = Creepster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ugly",
});

export const metadata: Metadata = {
  title: "Be My Valentine? 💕",
  description: "A special question for My Tiffy Tuffy",
};

export default function ValentineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br from-rose-900 via-red-800 to-pink-900 relative overflow-hidden ${dancingScript.variable} ${creepster.variable}`}
    >
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <svg
              className="w-8 h-8 text-pink-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Sparkle overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />

      {children}
    </div>
  );
}
