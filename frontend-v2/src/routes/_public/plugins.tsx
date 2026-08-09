import { useMemo, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

type PluginItem = {
  name: string;
  href: string;
  icon: string;
  tags: string[];
};

export const Route = createFileRoute("/_public/plugins")({
  head: () => ({
    meta: [
      { title: "Plugins | Wakana" },
      {
        name: "description",
        content:
          "Open source plugins for automatic programming metrics. Search supported editors and IDEs.",
      },
    ],
  }),
  component: RouteComponent,
});

const plugins: PluginItem[] = [
  {
    name: "VS Code",
    href: "https://wakatime.com/vs-code",
    icon: "/editor-icons/vs-code.png",
    tags: ["vscode", "visual studio code", "code"],
  },
  {
    name: "Cursor",
    href: "https://wakatime.com/cursor",
    icon: "/editor-icons/cursor.png",
    tags: ["ai editor"],
  },
  {
    name: "Zed",
    href: "https://wakatime.com/zed",
    icon: "/editor-icons/zed.png",
    tags: ["editor"],
  },
  {
    name: "Antigravity",
    href: "https://wakatime.com/antigravity",
    icon: "/editor-icons/antigravity.png",
    tags: ["editor"],
  },
  {
    name: "Kiro",
    href: "https://wakatime.com/kiro",
    icon: "/editor-icons/kiro.png",
    tags: ["editor"],
  },
  {
    name: "Neovim",
    href: "https://wakatime.com/neovim",
    icon: "/editor-icons/neovim.png",
    tags: ["vim", "terminal", "nvim"],
  },
  {
    name: "IntelliJ IDEA",
    href: "https://wakatime.com/intellij-idea",
    icon: "/editor-icons/intellij-idea.png",
    tags: ["jetbrains", "intellij", "idea"],
  },
  {
    name: "Jupyter",
    href: "https://wakatime.com/jupyter",
    icon: "/editor-icons/jupyter.png",
    tags: ["notebook", "python"],
  },
  {
    name: "Rider",
    href: "https://wakatime.com/rider",
    icon: "/editor-icons/rider.png",
    tags: ["jetbrains", "dotnet", "csharp"],
  },
  {
    name: "PowerPoint",
    href: "https://wakatime.com/powerpoint",
    icon: "/editor-icons/powerpoint.png",
    tags: ["office", "presentation"],
  },
  {
    name: "Postman",
    href: "https://wakatime.com/postman",
    icon: "/editor-icons/postman.png",
    tags: ["api", "testing"],
  },
  {
    name: "PyCharm",
    href: "https://wakatime.com/pycharm",
    icon: "/editor-icons/pycharm.png",
    tags: ["jetbrains", "python"],
  },
  {
    name: "Micro",
    href: "https://wakatime.com/micro",
    icon: "/editor-icons/micro.png",
    tags: ["editor", "terminal"],
  },
  {
    name: "Figma",
    href: "https://wakatime.com/figma",
    icon: "/editor-icons/figma.png",
    tags: ["design"],
  },
  {
    name: "Excel",
    href: "https://wakatime.com/excel",
    icon: "/editor-icons/excel.png",
    tags: ["spreadsheet", "office"],
  },
  {
    name: "Sublime Text",
    href: "https://wakatime.com/sublime-text",
    icon: "/editor-icons/sublime-text.png",
    tags: ["sublime", "editor"],
  },
  {
    name: "Vim",
    href: "https://wakatime.com/vim",
    icon: "/editor-icons/vim.png",
    tags: ["terminal", "modal"],
  },
  {
    name: "TextMate",
    href: "https://wakatime.com/textmate",
    icon: "/editor-icons/textmate.png",
    tags: ["editor", "macos"],
  },
  {
    name: "Terminal",
    href: "https://wakatime.com/terminal",
    icon: "/editor-icons/terminal.png",
    tags: ["cli", "shell"],
  },
  {
    name: "Visual Studio",
    href: "https://wakatime.com/visual-studio",
    icon: "/editor-icons/visual-studio.png",
    tags: ["dotnet", "microsoft"],
  },
  {
    name: "RubyMine",
    href: "https://wakatime.com/rubymine",
    icon: "/editor-icons/rubymine.png",
    tags: ["jetbrains", "ruby"],
  },
  {
    name: "RustRover",
    href: "https://wakatime.com/rustrover",
    icon: "/editor-icons/rustrover.png",
    tags: ["jetbrains", "rust"],
  },
  {
    name: "Xcode",
    href: "https://wakatime.com/xcode",
    icon: "/editor-icons/xcode.png",
    tags: ["apple", "ios", "macos"],
  },
  {
    name: "WebStorm",
    href: "https://wakatime.com/webstorm",
    icon: "/editor-icons/webstorm.png",
    tags: ["javascript", "jetbrains"],
  },
];

function matchesQuery(item: PluginItem, query: string) {
  if (!query) return true;

  const haystack = [item.name, ...item.tags].join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function PluginAvatar({ item }: { item: PluginItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      title={item.name}
      aria-label={item.name}
      className={cn(
        "group flex flex-col items-center justify-start gap-2 rounded-3xl px-2 py-3 text-center transition",
        "hover:-translate-y-0.5 hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-16 items-center justify-center rounded-full border border-border/70 bg-card shadow-sm transition",
          "group-hover:border-primary/30 group-hover:shadow-md"
        )}
      >
        <img
          src={item.icon}
          alt={item.name}
          className="size-8 object-contain"
          loading="lazy"
        />
      </span>
      <span className="sr-only">{item.name}</span>
    </a>
  );
}

function RouteComponent() {
  const [search, setSearch] = useState("");

  const filteredPlugins = useMemo(
    () => plugins.filter((item) => matchesQuery(item, search)),
    [search]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Plugins
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Open source plugins for automatic programming metrics.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <label className="sr-only" htmlFor="plugin-search">
          Search plugins
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="plugin-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search supported editors and IDEs..."
            className="h-11 pl-10 text-base"
          />
        </div>
      </div>

      <section className="mt-12">
        {filteredPlugins.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredPlugins.map((item) => (
              <PluginAvatar key={item.name} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-background/80 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No plugins match your search.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
