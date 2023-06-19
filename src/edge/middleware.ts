import { getIronSession } from "iron-session/edge";
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server.js";

import { ServerSession, SessionOptions } from "../types/index.js";
import { cookieRegex, isTokenExpired } from "../utils/index.js";

type Cookie = {
  name: string;
  value: string;
  httpOnly: boolean;
  path: string;
  maxAge: number;
  sameSite: "lax";
  secure: boolean;
};

type RefreshTokenCallback = (session: ServerSession) => Promise<boolean>;
type UserInfoCallback = (session: ServerSession) => Promise<boolean>;

type Options = {
  loginPath: string;
  sessionOptions: SessionOptions;
  refreshToken: RefreshTokenCallback;
  getUserInfo: UserInfoCallback;
};

export const withSession = (options: Options) => (next: NextMiddleware) => {
  return async (req: NextRequest, event: NextFetchEvent) => {
    let sessionCookie: Pick<Cookie, "name" | "value"> | null = null;
    let sessionCookieValue: string | null = null;
    let refreshFailed = false;

    // Do nothing for requests with a body.
    // This is either a server action or route handler request.
    if (req.body !== null) {
      return next(req, event);
    }

    // Do nothing, if there is no session cookie.
    if (!req.cookies.has(options.sessionOptions.cookieName)) {
      return next(req, event);
    }

    // Create a mocked response object that
    // saves set cookies.
    const res = createEdgeResponse((rawValue, cookie) => {
      sessionCookie = cookie;
      sessionCookieValue = rawValue;
    });

    // Get session from current request.
    const session = (await getIronSession(
      req,
      res,
      options.sessionOptions
    )) as ServerSession;

    // Check if token pair needs to be refreshed.
    if (
      session.tokenResponse &&
      isTokenExpired(session.tokenResponse.accessToken)
    ) {
      const success = await options.refreshToken(session);

      if (!success) {
        refreshFailed = true;
      }

      // Fetch user info if refresh was successful.
      await options.getUserInfo(session);
    }

    // Redirect to login page if refresh failed.
    if (refreshFailed && req.nextUrl.pathname !== "/auth/login") {
      return NextResponse.redirect(req.nextUrl.origin + "/auth/login");
    } else if (sessionCookieValue) {
      // Set new session cookie for current request, so that
      // the page gets the updated session.
      req.cookies.set({
        name: sessionCookie!.name,
        value: sessionCookie!.value,
        ...createCookieOptions(options.sessionOptions),
      });
    }

    const nextRes = (await next(req, event)) as NextResponse;

    // If the session cookie was updated in this middleware,
    // set it on the response.
    if (sessionCookie) {
      nextRes.cookies.set({
        name: (sessionCookie as Cookie).name,
        value: (sessionCookie as Cookie).value,
        ...createCookieOptions(options.sessionOptions),
      });
    }

    return nextRes;
  };
};

const createCookieOptions = (sessionOptions: SessionOptions) => ({
  httpOnly: sessionOptions.cookieOptions?.httpOnly ?? true,
  path: sessionOptions.cookieOptions?.path ?? "/",
  maxAge: sessionOptions.cookieOptions?.maxAge ?? 1295940,
  sameSite: sessionOptions.cookieOptions?.sameSite ?? "lax",
  secure:
    sessionOptions.cookieOptions?.secure ??
    process.env.NODE_ENV === "production",
});

const createEdgeResponse = (
  onCookie: (rawValue: string, cookie: Pick<Cookie, "name" | "value">) => void
) => {
  return {
    headers: {
      append(_name: string, value: string) {
        cookieRegex.lastIndex = 0;
        const matches = cookieRegex.exec(value);

        if (matches?.groups?.cookieName && matches?.groups?.cookieValue) {
          // @todo extract from cookie.
          onCookie(value, {
            name: matches.groups.cookieName,
            value: matches.groups.cookieValue,
          });
        }
      },
    },
  } as Response;
};
