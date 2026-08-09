import { Link } from "@tanstack/react-router";

import { cn } from "~/lib/utils";

const items = [
  // { name: "Blog", href: "/blog" },
  { name: "Faq", href: "/faqs" },
  { name: "Plugins", href: "/plugins" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Sign in", href: "/auth/login" },
];

export function NavItems({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li key={item.name}>
          <Link
            to={item.href}
            className="inline-flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-primary transition-opacity hover:opacity-70 focus:outline-none"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
