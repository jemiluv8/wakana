import { Metadata } from "next";
import Link from "next/link";

import { OTPSignIn } from "@/components/otp-sign-in";
import { SocialLogin } from "@/components/social-login";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  return (
    <div>
      <div className="flex flex-col justify-center justify-items-center space-y-2 text-center align-middle">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          Create your account
        </h1>
      </div>
      <OTPSignIn />
      <SocialLogin />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link href="/auth/signin" className="underline underline-offset-4">
          Already have an account? Sign In
        </Link>
      </p>
    </div>
  );
}
