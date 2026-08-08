import { Link } from "@tanstack/react-router";

const items = [
  { title: "General", to: "/settings" },
  { title: "Profile", to: "/settings/profile" },
  { title: "Preferences", to: "/settings/preferences" },
];

export function SettingsNavigation() {
  return (
    <nav className="grid gap-2 text-sm">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: true }}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{
            className:
              "rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground",
          }}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

