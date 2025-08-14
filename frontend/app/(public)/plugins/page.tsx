import { ExternalLink, Code, Download, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Plugins | Wakana",
  description: "Compatible with all WakaTime plugins. Track your coding activity across 40+ editors and IDEs.",
};

const popularPlugins = [
  {
    name: "VS Code",
    description: "Most popular code editor with automatic time tracking and productivity metrics",
    icon: "🆚",
    url: "https://wakatime.com/vs-code",
    marketplaceUrl: "https://marketplace.visualstudio.com/items?itemName=WakaTime.vscode-wakatime",
    features: ["Automatic time tracking", "Dashboard metrics", "Goal tracking", "Privacy controls"]
  },
  {
    name: "IntelliJ IDEA",
    description: "Full-featured IDE with robust WakaTime plugin support for Java development",
    icon: "💡",
    url: "https://wakatime.com/intellij-idea",
    features: ["Project time tracking", "Language metrics", "Productivity insights", "Team dashboards"]
  },
  {
    name: "Vim/Neovim",
    description: "Powerful text editors for command-line enthusiasts with lightweight tracking",
    icon: "⚡",
    url: "https://wakatime.com/vim",
    neovimUrl: "https://wakatime.com/neovim", 
    features: ["Terminal integration", "Minimal overhead", "Custom keybindings", "Plugin ecosystem"]
  },
  {
    name: "Sublime Text",
    description: "Fast and lightweight text editor with seamless WakaTime integration",
    icon: "📝",
    url: "https://wakatime.com/sublime-text",
    features: ["Package Control install", "Real-time tracking", "Multiple projects", "Cross-platform"]
  },
  {
    name: "PyCharm",
    description: "Python-focused IDE with comprehensive development time tracking",
    icon: "🐍",
    url: "https://wakatime.com/pycharm",
    features: ["Python-specific metrics", "Debug time tracking", "Virtual environment support", "Code quality insights"]
  },
  {
    name: "Emacs",
    description: "Extensible, customizable text editor with Elisp-based WakaTime integration",
    icon: "🔧",
    url: "https://wakatime.com/emacs",
    features: ["Elisp package", "Org-mode support", "Custom configurations", "Productivity analytics"]
  },
];

export default function PluginsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Supported Plugins</h1>
      
      <div className="space-y-8">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              100% WakaTime Compatible
            </h2>
          </div>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            Wakana works with all existing WakaTime plugins. Simply point your plugin configuration to your Wakana instance 
            and continue using your favorite editor without any changes to your workflow.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Popular Editors & IDEs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularPlugins.map((plugin, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{plugin.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{plugin.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plugin.description}</p>
                
                
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={plugin.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Plugin Info
                  </a>
                  {plugin.marketplaceUrl && (
                    <a 
                      href={plugin.marketplaceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Install
                    </a>
                  )}
                  {plugin.neovimUrl && (
                    <a 
                      href={plugin.neovimUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Neovim
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Installation Instructions
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <p className="font-medium">Download the plugin for your editor</p>
                <a 
                  href="https://wakatime.com/plugins" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-sm mt-1"
                >
                  Browse all plugins at wakatime.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <p className="font-medium">Configure the plugin with your Wakana API settings</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Follow our <a href="/setup" className="text-blue-600 dark:text-blue-400 hover:underline">setup guide</a> for detailed configuration instructions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <p className="font-medium">Start coding and track your activity</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Your coding time will automatically be tracked and sent to your Wakana dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Need help with setup? Check out our comprehensive guide.
          </p>
          <a 
            href="/setup" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <Code className="h-4 w-4" />
            Setup Guide
          </a>
        </div>
      </div>
    </div>
  );
}