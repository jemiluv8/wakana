import { Clock, Code, Download, Gauge, Rocket, Settings } from "lucide-react";

import { FadeOnView } from "@/components/fade-on-view";
import { Installation } from "@/components/installation";

export const metadata = {
  title: "Setup Guide | Wakana",
  description:
    "Get started with Wakana in minutes. Track your coding activity across all your favorite editors and IDEs.",
};

const steps = [
  {
    number: "01",
    title: "Install WakaTime Plugin",
    description:
      "Choose your editor and install the WakaTime plugin. Works with VS Code, IntelliJ, Vim, and 40+ other editors.",
    icon: Download,
    color: "from-blue-500 to-cyan-500",
    action: {
      text: "Browse Plugins",
      url: "https://wakatime.com/plugins",
    },
  },
  {
    number: "02",
    title: "Locate Config File",
    description:
      "Find the ~/.wakatime.cfg file on your computer. It's usually in your home directory (you may need to show hidden files).",
    icon: Settings,
    color: "from-purple-500 to-pink-500",
    details: [
      "macOS/Linux: ~/.wakatime.cfg",
      "Windows: %USERPROFILE%\\.wakatime.cfg",
    ],
  },
  {
    number: "03",
    title: "Update Configuration",
    description:
      "Replace the contents with your Wakana API configuration. Your personal API key will be generated automatically.",
    icon: Code,
    color: "from-green-500 to-emerald-500",
    showConfig: true,
  },
  {
    number: "04",
    title: "Start Coding",
    description:
      "Open your editor and start coding! Your activity will automatically be tracked and sent to your Wakana dashboard.",
    icon: Rocket,
    color: "from-orange-500 to-red-500",
    benefits: [
      "Real-time tracking",
      "Detailed analytics",
      "Project insights",
      "Goal tracking",
    ],
  },
];

const features = [
  {
    icon: Clock,
    title: "Automatic Time Tracking",
    description: "Track coding time automatically without manual timers",
  },
  {
    icon: Gauge,
    title: "Real-time Analytics",
    description: "See your productivity metrics update in real-time",
  },
  {
    icon: Code,
    title: "Multi-Editor Support",
    description: "Works with VS Code, IntelliJ, Vim, and 40+ editors",
  },
];

export default function SetupPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <FadeOnView>
          <h1 className="text-4xl font-bold mb-6">
            Get Started in 4 Simple Steps
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Start tracking your coding activity in minutes. Works with your
            existing editor setup—no disruption to your workflow.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2"
              >
                <feature.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </FadeOnView>
      </div>

      {/* Steps Section */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
          >
            <div className="flex items-start gap-4">
              {/* Step number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {step.description}
                </p>

                {/* Action button */}
                {step.action && (
                  <a
                    href={step.action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {step.action.text}
                    <Download className="h-4 w-4" />
                  </a>
                )}

                {/* Details list */}
                {step.details && (
                  <div className="space-y-2 mt-4">
                    {step.details.map((detail, i) => (
                      <div key={i}>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {detail}
                        </code>
                      </div>
                    ))}
                  </div>
                )}

                {/* Configuration display */}
                {step.showConfig && (
                  <div className="mt-4">
                    <Installation />
                  </div>
                )}

                {/* Benefits list */}
                {step.benefits && (
                  <div className="mt-4">
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {step.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-green-500">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to Start Tracking?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of developers who use Wakana to understand their coding
          patterns and boost productivity.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Get Your API Key
          <Rocket className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
