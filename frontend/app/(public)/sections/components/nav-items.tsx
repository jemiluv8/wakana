import { cn } from "@/lib/utils";

const items = [
  { name: "Blog", href: "/blog" },
  { name: "Faq", href: "/faqs" },
  { name: "Plugins", href: "/plugins" },
  { name: "Leaderboard", href: "/leaderboards" },
  { name: "Sign in", href: "/login" },
];

export function NavItems({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li key={item.name}>
          <a
            href={item.href}
            className="block w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
