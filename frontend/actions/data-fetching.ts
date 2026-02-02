"use server";

import { redirect } from "next/navigation";

import { getSession } from "./session";

const { NEXT_PUBLIC_API_URL } = process.env;

// doesn't throw. returns null when not found
export async function fetchData<T>(
  url: string,
  auth: boolean = true,
  noCache: boolean = false
): Promise<T | null> {
  let redirectToLogin = false;
  try {
    let session = null;
    if (auth) {
      try {
        const response = await getSession(false);
        if (response.isLoggedIn) {
          session = response;
        } else {
          redirectToLogin = true;
        }
      } catch (error) {
        if (auth) {
          throw error;
        }
      }
    }

    if (redirectToLogin) {
      redirect("/login");
    }

    const apiResponse = await fetch(`${NEXT_PUBLIC_API_URL}/api${url}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...(session && session.token
          ? {
              token: `${session.token}`,
            }
          : {}),
      },
      ...(noCache
        ? { cache: "no-store" as const }
        : {
            next: {
              revalidate: 300,
              tags: ["dashboard-data"],
            },
          }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`API Error [${apiResponse.status}] for ${url}:`, errorText);
      throw new Error(
        `API Error ${apiResponse.status}: ${errorText || apiResponse.statusText}`
      );
    }

    const json = await apiResponse.json();
    return json;
  } catch (error) {
    console.error("Error fetching data:", error, "URL:", url);
    // Re-throw the error so components can handle it properly
    // instead of silently returning null
    if (redirectToLogin) {
      redirect("/login");
    } else {
      throw error;
    }
  } finally {
    if (redirectToLogin) {
      redirect("/login");
    }
  }
  return null as T;
}
