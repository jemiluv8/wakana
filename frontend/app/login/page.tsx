import { Metadata } from "next";

import { ClaudeOTPSignIn } from "@/components/claude-otp-signin";
import { ClaudeSocialLogin } from "@/components/claude-social-login";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Wakana account
        </p>
      </div>

      {/* Login Form */}
      <div className="space-y-4 sm:space-y-6">
        <ClaudeSocialLogin />
        <ClaudeOTPSignIn />
      </div>

      {/* Legal Text - Only show on mobile in main content, hidden on desktop (shown in footer) */}
      <div className="mt-6 text-center sm:hidden">
        <p className="text-xs text-muted-foreground leading-relaxed px-2">
          By continuing, you acknowledge that you have read and agree to our{" "}
          <a 
            href="https://wakana.io/terms" 
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a 
            href="https://wakana.io/policy" 
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Desktop Legal Text */}
      <div className="hidden sm:block mt-8 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          By continuing, you acknowledge that you have read and agree to our{" "}
          <a 
            href="https://wakana.io/terms" 
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a 
            href="https://wakana.io/policy" 
            className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
