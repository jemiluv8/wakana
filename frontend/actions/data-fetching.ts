"use server";

import { getSession } from "./session";

const { API_URL } = process.env;

// doesn't throw. returns null when not found
export async function fetchData<T>(
  url: string,
  auth: boolean = true,
): Promise<T | null> {
  try {
    let session = null;
    if (auth) {
      try {
        const response = await getSession(false);
        if (response.isLoggedIn) {
          session = response;
        }
      } catch (error) {
        if (auth) {
          throw error;
        }
      }
    }

    const apiResponse = await fetch(`${API_URL}/api/${url}`, {
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
    });
    if (apiResponse.status > 202) {
      throw new Error("Error fetching clients");
    }
    const json = await apiResponse.json();
    return json;
  } catch (error) {
    console.log("Error logging in", error);
  }
  return null as T;
}
