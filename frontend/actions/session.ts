"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SessionData, sessionOptions } from "@/lib/session/options";

export async function getSession(redirectIfNotLoggedIn = true) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn && redirectIfNotLoggedIn) {
    redirect("/login");
  }

  // Return only serializable data, not the iron-session object with methods
  return {
    isLoggedIn: session.isLoggedIn,
    user: session.user,
    token: session.token,
  };
}

export async function getSessionUser() {
  const session = await getSession();
  return session.user;
}

export async function redirectIfLoggedIn() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.isLoggedIn) {
    redirect("/dashboard");
  }
}
