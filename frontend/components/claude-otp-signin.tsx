"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { initiateOTPLoginAction, processLoginWithOTP } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { SimpleInput } from "@/components/ui/simple-input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { PKCEGenerator, PKCEResult } from "@/lib/oauth/pkce";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type Props = {
  className?: string;
};

const SubmitButton = ({ onClick, loading }: { onClick: any; loading: boolean }) => {
  const { pending } = useFormStatus();
  const isLoading = pending || loading;
  
  return (
    <Button
      type="submit"
      onClick={onClick}
      loading={isLoading}
      className="w-full"
      size="lg"
    >
      Continue
    </Button>
  );
};

export function ClaudeOTPSignIn({ className }: Props) {
  const [state, formAction] = useFormState(initiateOTPLoginAction, {
    message: null,
  });
  const [isSent, setSent] = useState(false);
  const [email, setEmail] = useState<string>();
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [pkce, setPKCE] = useState<PKCEResult>();
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const pkceFactory = new PKCEGenerator();
    pkceFactory.generatePKCE().then((result) => {
      setPKCE(result);
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  React.useEffect(() => {
    const message = state.message;
    if (state.message) {
      toast({
        title: message.title,
        description: message.description,
        variant: message.variant,
      });
    }

    if (state.success) {
      setSent(true);
      setEmail(form.getValues("email"));
      // Start countdown when OTP is sent
      setResendCountdown(120);
      setCanResend(false);
    }
  }, [state, form]);

  // Countdown timer effect
  useEffect(() => {
    if (isSent && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
  }, [isSent, resendCountdown]);

  const loginHandler = async () => {
    if (!(await form.trigger())) {
      const errors = form.formState.errors;
      if (errors.email) {
        return toast({
          title: "Invalid email",
          description: errors.email.message,
          variant: "destructive",
        });
      }
      return;
    }

    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle resend functionality
  const handleResend = () => {
    setSent(false);
    setResendCountdown(120);
    setCanResend(false);
  };

  async function onComplete(otp: string) {
    try {
      setIsLoading(true);
      if (!email || !pkce?.code_verifier) {
        return toast({
          title: "Invalid OTP",
          description: "Please check your OTP and try again.",
          variant: "destructive",
        });
      }
      const response = await processLoginWithOTP({
        email,
        otp,
        code_verifier: pkce?.code_verifier || "",
      });

      if (response && response.message) {
        const { message } = response;
        toast({
          title: message.title,
          description: message.description,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground">
            Enter the code generated from the link sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-4 sm:space-y-6">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center z-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <InputOTP
              maxLength={6}
              autoFocus
              onComplete={onComplete}
              disabled={isLoading}
              className="gap-2 justify-center"
              render={({ slots }) => (
                <InputOTPGroup className="gap-2">
                  {slots.map((slot, index) => (
                    <InputOTPSlot
                      key={index.toString()}
                      {...slot}
                      className={cn(
                        "w-14 h-14 sm:w-12 sm:h-12 rounded-lg text-lg font-medium",
                        "transition-all duration-200",
                        "bg-muted/50 border-2 border-border hover:border-border/80",
                        "focus:border-primary focus:ring-0",
                        "focus:outline-2 focus:outline-primary focus:outline-offset-2",
                        "dark:bg-muted/50 dark:border-border dark:hover:border-border/60"
                      )}
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>

          {/* Verify Button */}
          <button
            type="button"
            className="w-full h-14 sm:h-12 px-8 sm:px-6 rounded-lg bg-foreground text-background font-medium transition-all duration-200 hover:bg-foreground/90"
            disabled={isLoading}
          >
            Verify Email Address
          </button>
        </div>

        {/* Resend Link with Countdown */}
        <div className="mt-6 text-center">
          {canResend ? (
            <p className="text-sm text-muted-foreground">
              Not seeing the email in your inbox?{" "}
              <button
                onClick={handleResend}
                type="button"
                className="text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-2"
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
    <div className="w-full">
      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-medium">
            Or
          </span>
        </div>
      </div>

      <Form {...form}>
        <form ref={formRef} action={formAction} className="w-full">
          <div className={cn("flex flex-col space-y-6 w-full", className)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <SimpleInput
                      placeholder="Email address"
                      type="email"
                      error={fieldState.error?.message}
                      {...field}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                    />
                  </FormControl>
                </FormItem>
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
            
            <SubmitButton onClick={loginHandler} loading={isLoading} />
          </div>
        </form>
      </Form>

      {/* Already have a code? */}
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
            className="text-primary hover:text-primary/80 font-medium transition-colors underline underline-offset-2"
          >
            Enter code
          </button>
        </p>
      </div>
    </div>
  );
}