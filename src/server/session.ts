import cookie from "cookie";
import { getIronSession } from "iron-session";
import type { cookies } from "next/headers.js";

import { ServerSession, SessionOptions } from "../types/index.js";
import { createReadOnlySession, createServerSession } from "../utils/index.js";
import { isTokenExpired } from "../utils/index.js";

type NextCookiesFunc = typeof cookies;

type RefreshTokenCallback = (session: ServerSession) => Promise<void>;

export const createSessionManager = (refreshToken: RefreshTokenCallback) => {
  const getCoreServerSession = async (
    cookies: NextCookiesFunc,
    sessionOptions: SessionOptions
  ) => {
    const req = createNextRequest(cookies);
    const res = createNextResponse(cookies);

    const ironSession = await getIronSession(req, res, sessionOptions);

    return createServerSession(ironSession);
  };

  /**
   * Wrapper around getIronSession which creates mock
   * req and res objects that integrate iron-session
   * with the next 13 cookies() function.
   *
   * @param cookies - The NextJS cookies() function.
   * @param sessionOptions - The iron-session options.
   */
  const getServerSession = async (
    cookies: NextCookiesFunc,
    sessionOptions: SessionOptions
  ) => {
    const session = await getCoreServerSession(cookies, sessionOptions);

    if (
      session.tokenResponse &&
      isTokenExpired(session.tokenResponse.accessToken)
    ) {
      console.log("SERVER: Token exp!");
      await refreshToken(session);
    }

    return session;
  };

  /**
   * Gets the session as read only.
   * This is essentialy the same as getServerSession(),
   * but the session cannot be saved.
   *
   * The only reason this function exists is because
   * cookies cannot be written in react server components.
   *
   * @param cookies - The NextJS cookies() function.
   * @param sessionOptions - The iron-session options.
   */
  const getReadonlySession = async (
    cookies: NextCookiesFunc,
    sessionOptions: SessionOptions
  ) => {
    const session = await getCoreServerSession(cookies, sessionOptions);

    return createReadOnlySession(session);
  };

  return {
    getServerSession,
    getReadonlySession,
  };
};

/**
 * Creates a mock request object with the
 * needed session cookie in the headers.
 *
 * @param cookies - The NextJS cookies() function.
 */
const createNextRequest = (cookies: NextCookiesFunc) => {
  const sessionCookie = cookies().get("next-session");
  if (!sessionCookie) {
    return {
      headers: new Headers(),
      credentials: "include",
    } as Request;
  }

  return {
    headers: new Headers({
      cookie: `${sessionCookie.name}=${sessionCookie.value}`,
    }),
    credentials: "include",
  } as Request;
};

/**
 * Creates a mock response object which uses the
 * cookies() function to set the session cookie on the
 * res object.
 *
 * @param cookies - The NextJS cookies() function.
 */
const createNextResponse = (cookies: NextCookiesFunc, readonly = false) => {
  return {
    headers: {
      append(_name: string, value: string) {
        const data = cookie.parse(value);
        const cookieName = "next-session";
        const cookieValue = data[cookieName];

        if (readonly) {
          return;
        }

        if (cookieValue) {
          cookies().set({
            name: "next-session",
            value: data["next-session"],
            httpOnly: true,
            path: data["Path"],
            maxAge: parseInt(data["Max-Age"]),
            sameSite: data["SameSite"] as any,
          });
        } else {
          cookies().delete(cookieName);
        }
      },
    },
  } as Response;
};
