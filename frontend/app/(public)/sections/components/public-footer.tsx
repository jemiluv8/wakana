import { Github, Heart, ExternalLink, BookOpen, Users, BarChart3, Settings, Trophy, Clock, Code, LogIn, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerSections = [
  {
    title: "Get Started",
    links: [
      { name: "Setup Guide", href: "/setup", icon: Settings },
      { name: "Login", href: "/login", icon: LogIn },
      { name: "FAQ", href: "/faqs", icon: HelpCircle },
      { name: "Plugins", href: "/plugins", icon: Code },
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "/blog", icon: BookOpen },
      { name: "GitHub", href: "https://github.com/jemiluv8/wakana", icon: Github, external: true },
      { name: "WakaTime Plugins", href: "https://wakatime.com/plugins", icon: null, external: true },
      { name: "API Documentation", href: "/api/docs", icon: null },
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/policy", icon: null },
      { name: "Terms of Service", href: "/terms", icon: null },
      { name: "About", href: "/about", icon: null },
    ]
  }
];

export default function PublicFooter() {
  return (
    <footer className="relative border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-500 rounded-full filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <Image 
                width={120} 
                height={60} 
                src="/white-logo.png" 
                alt="Wakana Logo"
                className="dark:invert-0 invert"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 lg:mb-6 max-w-md leading-relaxed text-sm lg:text-base">
              Observe your work habits in real time with developer dashboards 
              for insights into your coding patterns and productivity.
            </p>
            
            {/* Social links - hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://github.com/jemiluv8/wakana"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">Star on GitHub</span>
              </a>
            </div>
          </div>

          {/* Links sections - simplified on mobile */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {footerSections.map((section, index) => (
                <div key={index} className={index === 2 ? "hidden lg:block" : ""}>
                  <h3 className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-2 lg:space-y-3">
                    {section.links.slice(0, index === 0 ? 3 : 2).map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
                        >
                          {link.icon && (
                            <link.icon className="h-3 w-3 lg:h-3.5 lg:w-3.5 opacity-70 group-hover:opacity-100" />
                          )}
                          <span className="text-xs lg:text-sm">{link.name}</span>
                          {link.external && (
                            <ExternalLink className="h-2.5 w-2.5 lg:h-3 lg:w-3 opacity-50" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section - simplified on mobile */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
              <span>Made with</span>
              <Heart className="h-3 w-3 lg:h-4 lg:w-4 text-red-500 fill-current" />
              <span className="hidden lg:inline">by developers, for developers</span>
              <span className="lg:hidden">for developers</span>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
              <span>© 2024 Wakana</span>
              <div className="hidden lg:flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Self-hosted analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}