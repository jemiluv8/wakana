import * as React from "react";
import { createServerFn } from "@tanstack/react-start";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// import { toast } from "~/components/ui/use-toast";
import { PKCEGenerator, PKCEResult } from "~/lib/oauth/pkce";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { Input } from "~/components/ui/input";
import { Button, buttonVariants } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const formSchema = z.object({
  email: z.string().email(),
});

const initiateOTPLogin = createServerFn({ method: "POST" })
  .validator(formSchema)
  .handler(async ({ data }) => {
    // move logic from initiateOTPLoginAction here
    console.log("groot", data);
    // return await authService.initiateOTPLogin(data);
    return {
      success: false,
      message: {
        title: "Error",
        description: "Not implemented",
      },
    };
  });

const processLoginWithOTP = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      otp: z.string().length(6),
      code_verifier: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    // move logic from processLoginWithOTP here
    // return await authService.processOTPLogin(data);
    console.log("groot", data);
    return {
      message: {
        title: "Error",
        description: "Not implemented",
      },
    };
  });

type Props = {
  className?: string;
};

export function OTPSignIn({ className }: Props) {
  const [isSent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [pkce, setPKCE] = React.useState<PKCEResult>();

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
      const response = await initiateOTPLogin({
        data: value,
      });

      if (response?.message) {
        toast.success(response.message.title, {
          description: response.message.description,
        });
      }

      if (response?.success) {
        setEmail(value.email);
        setSent(true);
      }
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

      const response = await processLoginWithOTP({
        data: {
          email,
          otp,
          code_verifier: pkce.code_verifier,
        },
      });

      if (response?.message) {
        toast.error(response.message.title, {
          description: response.message.description,
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
      <div className={cn("flex flex-col items-center space-y-4", className)}>
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
                className="h-15.5 w-15.5"
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
            {isSubmitting && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Continue
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
