import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Icons } from "~/components/icons";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { useAuth } from "~/lib/providers/auth-provider";
import { useApiMutation } from "~/hooks";
import { PKCEGenerator, PKCEResult } from "~/lib/oauth/pkce";
import { cn } from "~/lib/utils";
import type { AuthUser } from "~/lib/auth/storage";

const formSchema = z.object({
  email: z.string().email(),
});

type Props = {
  className?: string;
};

type InitOtpResponse = {
  message: string;
};

type AuthLoginResponse = {
  message: string;
  status: number;
  data: {
    token: string;
    user: AuthUser;
  };
};

export function OTPSignIn({ className }: Props) {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [isSent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [pkce, setPKCE] = React.useState<PKCEResult>();
  const [otp, setOtp] = React.useState("");
  const [resendCountdown, setResendCountdown] = React.useState(120);
  const [canResend, setCanResend] = React.useState(false);

  const { mutate: initiateOtpLogin, isPending } =
    useApiMutation<InitOtpResponse>("/v1/auth/otp/create", {
      onSuccess: (data) => {
        setSent(true);
        setOtp("");
        setResendCountdown(120);
        setCanResend(false);
      },
      onError: (error) => {
        console.error("Failed:", error.message);
        toast.error(error.message, {
          description: "Failed to initiate OTP login",
        });
      },
    });

  const { mutate: verifyToken } = useApiMutation<AuthLoginResponse>(
    "/v1/auth/otp/verify",
    {
      onSuccess: (data: AuthLoginResponse) => {
        const token = data?.data?.token;
        const user = data?.data?.user;

        if (token && user) {
          setSession({ token, user });
        }

        navigate({
          to: "/dashboard",
        });
      },
      onError: (error) => {
        console.error("Failed:", error.message);
        toast.error(error.message, {
          description: "Failed to verify OTP",
        });
      },
    }
  );

  React.useEffect(() => {
    const generator = new PKCEGenerator();

    generator.generatePKCE().then((result) => {
      setPKCE(result);
    });
  }, []);

  React.useEffect(() => {
    if (!isSent || resendCountdown <= 0) {
      if (resendCountdown === 0) {
        setCanResend(true);
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isSent, resendCountdown]);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }: { value: any }) => {
      setEmail(value.email);
      initiateOtpLogin({ body: { ...value, set_cookie: false, ...pkce } });
    },
  });

  async function onComplete(otp: string) {
    try {
      setIsLoading(true);

      if (!email || !pkce?.code_verifier) {
        toast.error("Invalid OTP", {
          description: "Please check your OTP and try again.",
        });
        return;
      }

      verifyToken({
        body: {
          email,
          otp,
          code_verifier: pkce.code_verifier,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    setSent(false);
    setOtp("");
    setResendCountdown(120);
    setCanResend(false);
  };

  if (isSent) {
    return (
      <div className={cn("w-full text-primary", className)}>
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground">
            Enter the code generated from the link sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/50">
                <Icons.spinner className="size-5 animate-spin text-primary" />
              </div>
            )}

            <InputOTP
              maxLength={6}
              autoFocus
              disabled={isLoading}
              value={otp}
              onChange={setOtp}
              onComplete={onComplete}
              pattern={REGEXP_ONLY_DIGITS}
              className="justify-center gap-2 text-primary"
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, index: number) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={cn(
                      "size-14 rounded-lg border-2 border-border bg-muted/50 text-lg font-medium text-primary transition-all duration-200 hover:border-border/80 sm:size-12",
                      "focus:border-primary focus:outline-none data-[active=true]:border-primary data-[active=true]:ring-0",
                      "dark:border-border dark:bg-muted/50 dark:hover:border-border/60"
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={isLoading || otp.length !== 6}
            onClick={() => void onComplete(otp)}
            className="h-14 w-full rounded-lg bg-foreground text-background hover:bg-foreground/90 sm:h-12"
          >
            Verify Email Address
          </Button>
        </div>

        <div className="mt-6 text-center">
          {canResend ? (
            <p className="text-sm text-muted-foreground">
              Not seeing the email in your inbox?{" "}
              <button
                onClick={handleResend}
                type="button"
                className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              >
                Try sending again
              </button>
              .
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? You can request a new code in{" "}
              <span className="font-medium text-foreground">
                {formatCountdown(resendCountdown)}
              </span>
              .
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 font-medium text-muted-foreground">
            Or
          </span>
        </div>
      </div>

      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          children={(field: any) => (
            <div className="grid gap-1">
            <Input
              placeholder="Email address"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 px-4 text-base sm:text-[15px]"
            />

            {field.state.meta.errors.length > 0 && (
              <p className="px-1 text-xs text-destructive">
                {field.state.meta.errors[0]?.message}
                </p>
              )}
            </div>
          )}
        />

        <input
          type="hidden"
          name="code_challenge"
          value={pkce?.code_challenge || ""}
        />
        <input
          type="hidden"
          name="challenge_method"
          value={pkce?.challenge_method || ""}
        />

        <div className="mt-6">
          <form.Subscribe
            selector={(state: any) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }: any) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
                size="lg"
                className="h-12 w-full rounded-lg px-4 text-base sm:h-12"
              >
                {(isSubmitting || isPending) && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Continue
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have a verification code?{" "}
          <button
            onClick={() => {
              setSent(true);
              setResendCountdown(120);
              setCanResend(false);
            }}
            type="button"
            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
          >
            Enter code
          </button>
        </p>
      </div>
    </div>
  );
}
