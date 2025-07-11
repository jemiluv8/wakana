"use server";

import { redirect } from "next/navigation";

import { createIronSession } from "@/lib/server/auth";
import { SessionData } from "@/lib/session/options";
import {
  forgotPasswordSchema,
  otpLoginSchema,
  otpLoginValidateSchema,
  userNameSchema,
} from "@/lib/validations/user";

import { ApiClient } from "./api";

export async function loginAction(_: any, formData: FormData): Promise<any> {
  const validatedFields = userNameSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      message: {
        description: "Email and password are required",
        title: "Error",
        variant: "destructive",
      },
    };
  }

  return processLogin(validatedFields.data);
}

export async function initiateOTPLoginAction(
  _: any,
  formData: FormData
): Promise<any> {
  const payload = {
    email: formData.get("email"),
    code_challenge: formData.get("code_challenge"),
    challenge_method: formData.get("challenge_method"),
  };
  console.log("[payload]", payload);
  const validatedFields = otpLoginSchema.safeParse(payload);

  if (!validatedFields.success) {
    return {
      message: {
        description: "Invalid credentials", // intentionally vague
        title: "Error",
        variant: "destructive",
      },
    };
  }

  return processEmailLogin(validatedFields.data);
}

export async function validateOTPEmailAction(
  _: any,
  formData: FormData
): Promise<any> {
  const validatedFields = otpLoginValidateSchema.safeParse({
    otp: formData.get("otp"),
    email: formData.get("email"),
    code_verifier: formData.get("code_verifier"),
  });

  if (!validatedFields.success) {
    return {
      message: {
        description: "OTP is required",
        title: "Error",
        variant: "destructive",
      },
    };
  }

  return processLoginWithOTP(validatedFields.data);
}

export async function forgotPasswordAction(
  _: any,
  formData: FormData
): Promise<any> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  console.log("valodateFields", validatedFields);

  if (!validatedFields.success) {
    return {
      message: {
        description: "Please enter a valid email",
        title: "Error",
        variant: "destructive",
      },
    };
  }

  return processForgotPassword(validatedFields.data);
}

export async function processForgotPassword({ email }: { email: string }) {
  let redirectPath = null;
  try {
    const apiResponse = await ApiClient.POST(
      "/v1/auth/forgot-password",
      { email },
      { skipAuth: true }
    );

    const json = apiResponse.data as {
      data: SessionData;
      status?: number;
      message?: string;
    };

    console.log("json", json);

    if (!apiResponse.success) {
      return {
        message: {
          description: json.message || "Unexpected error logging in",
          title: "Login Error!",
          variant: "default",
        },
      };
    }

    // we really probably need a way to toast from here - like dump something that is used by UI to display some message
    redirectPath = `/login?message=${json.message}`;
  } catch (error) {
    console.log("Error sending forgot password request", error);
    return {
      message: {
        description: "Unexpected error logging in",
        title: "Login Error!",
        variant: "default",
      },
    };
  } finally {
    if (redirectPath) {
      redirect(redirectPath);
    }
    // redirect apparently throws an error so shouldn't be called inside a try catch
    // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
  }
}

export async function processEmailLogin(credentials: {
  email: string;
  code_challenge: string;
  challenge_method: string;
}) {
  const redirectPath = null;
  try {
    const apiResponse = await ApiClient.POST(
      "/v1/auth/otp/create",
      credentials,
      {
        skipAuth: true,
      }
    );

    console.log("apiResponse", apiResponse);

    const json = apiResponse.data as {
      data: SessionData;
      status?: number;
      message?: string;
    };

    if (!apiResponse.success) {
      return {
        message: {
          description: json.message || "Unexpected error logging in",
          title: "Login Error!",
          variant: "destructive",
        },
        sucess: false,
      };
    }

    return {
      message: {
        description: "Check your email for a login code",
        title: "Login OTP!",
        variant: "success",
      },
      success: true,
    };
  } catch (error) {
    console.log("Error logging in", error);
    return {
      message: {
        description: "Unexpected error logging in",
        title: "Login Error!",
        variant: "default",
      },
    };
  } finally {
    if (redirectPath) redirect(redirectPath);
    // redirect apparently throws an error so shouldn't be called inside a try catch
    // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
  }
}

export async function processLogin(credentials: {
  email: string;
  password: string;
}) {
  let redirectPath = null;
  try {
    const apiResponse = await ApiClient.POST("/v1/auth/login", credentials, {
      skipAuth: true,
    });

    const json = apiResponse.data as {
      data: SessionData;
      status?: number;
      message?: string;
    };

    if (!apiResponse.success) {
      return {
        message: {
          description: json.message || "Unexpected error logging in",
          title: "Login Error!",
          variant: "default",
        },
      };
    }

    await createIronSession(json.data);
    redirectPath = "/dashboard";
  } catch (error) {
    console.log("Error logging in", error);
    return {
      message: {
        description: "Unexpected error logging in",
        title: "Login Error!",
        variant: "default",
      },
    };
  } finally {
    if (redirectPath) redirect(redirectPath);
    // redirect apparently throws an error so shouldn't be called inside a try catch
    // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
  }
}

export async function processLoginWithOTP(credentials: {
  otp: string;
  code_verifier: string;
  email: string;
}) {
  console.log("credentials", credentials);
  let redirectPath = null;
  try {
    const apiResponse = await ApiClient.POST(
      "/v1/auth/otp/verify",
      credentials,
      {
        skipAuth: true,
      }
    );

    const json = apiResponse.data as {
      data: SessionData;
      status?: number;
      message?: string;
    };

    if (!apiResponse.success) {
      return {
        message: {
          description: json.message || "Unexpected error logging in",
          title: "Login Error!",
          variant: "default",
        },
      };
    }

    await createIronSession(json.data);
    const newUser = json.data.user.is_new_user;
    redirectPath = newUser ? "/installation" : "/dashboard";
  } catch (error) {
    console.log("Error logging in", error);
    return {
      message: {
        description: "Unexpected error logging in",
        title: "Login Error!",
        variant: "default",
      },
    };
  } finally {
    if (redirectPath) redirect(redirectPath);
    // redirect apparently throws an error so shouldn't be called inside a try catch
    // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
  }
}
