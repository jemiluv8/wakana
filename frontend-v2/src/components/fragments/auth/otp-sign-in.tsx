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
import { useApiMutation } from "~/hooks";
// import { toast } from "~/components/ui/use-toast";
import { PKCEGenerator, PKCEResult } from "~/lib/oauth/pkce";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
});

type Props = {
  className?: string;
};

type InitOtpResponse = {
  message: string;
};

export function OTPSignIn({ className }: Props) {
  const navigate = useNavigate();
  const [isSent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [pkce, setPKCE] = React.useState<PKCEResult>();

  const { mutate: initiateOtpLogin, isPending } =
    useApiMutation<InitOtpResponse>("/v1/auth/otp/create", {
      onSuccess: (data) => {
        console.log("User created:", data);
        setSent(true);
      },
      onError: (error) => {
        console.error("Failed:", error.message);
        toast.success(error.message, {
          description: "Failed to initiate OTP login",
        });
      },
    });

  const { mutate: verifyToken } = useApiMutation<InitOtpResponse>(
    "/v1/auth/otp/verify",
    {
      onSuccess: () => {
        navigate({
          to: "/dashboard",
        });
      },
      onError: (error) => {
        console.error("Failed:", error.message);
        toast.success(error.message, {
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

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }: { value: any }) => {
      setEmail(value.email);
      initiateOtpLogin({ body: { ...value, set_cookie: true, ...pkce } });
    },
  });

  async function onComplete(otp: string) {
    try {
      setIsLoading(true);

      console.log("pkce", pkce);

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

  if (isSent) {
    return (
      <div
        className={cn("flex flex-col items-center space-y-4 px-4", className)}
      >
        <InputOTP
          maxLength={6}
          autoFocus
          disabled={isLoading}
          onComplete={onComplete}
          pattern={REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index: number) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-15.5 w-15.5 text-primary"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="flex space-x-2">
          <span className="text-sm text-[#878787]">
            Didn't receive the email?
          </span>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm font-medium text-primary underline"
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col space-y-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        children={(field: any) => (
          <div>
            <Input
              placeholder="Enter email address"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="text-primary"
            />

            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-sm text-destructive">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state: any) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }: any) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            {(isSubmitting || isPending) && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Continue
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
