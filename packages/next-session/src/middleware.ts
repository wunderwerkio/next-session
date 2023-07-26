import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server.js";
import {
  AuthenticatedServerSession,
  ServerSession,
  TokenResponse,
} from "./types.js";
import {
  NextSessionCookieOptions,
  createSessionCookieValue,
} from "session-cookie";
import { SessionManager, createSessionManager } from "./sessionManager.js";
import { isTokenExpired } from "./utils.js";
import { NextMiddlewareResult } from "next/dist/server/web/types.js";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

type RefreshTokenCallback = (
  refreshToken: string
) => Promise<TokenResponse | Error>;
type UserInfoCallback = (session: ServerSession) => Promise<boolean>;

type UpdateSessionCallback = (
  session: AuthenticatedServerSession
) => Promise<AuthenticatedServerSession | Error>;

type Options = {
  loginPath: string;
  sessionManager: SessionManager;
  updateSession: UpdateSessionCallback;
};

export const withSession = (options: Options) => (next: NextMiddleware) => {
  return async (req: NextRequest, event: NextFetchEvent) => {
    // Retrieve session.
    const session = await options.sessionManager.getServerSession(req);

    // Do nothing for anonymous users.
    if (!session.authenticated) {
      return next(req, event);
    }

    let refreshError: Error | null = null;
    let updatedSession: AuthenticatedServerSession | null = null;

    if (isTokenExpired(session.tokenResponse.accessToken)) {
      const result = await options.updateSession(session);

      if (result instanceof Error) {
        console.log("Refresh failed, deleting cookie");
        refreshError = result;
        req.cookies.delete(options.sessionManager.getCookieName());
      } else {
        updatedSession = result;
        console.log("set refreshed session for current request");
        await options.sessionManager.setSessionForNextRequest(result, req);
      }
    }

    const nextRes = await next(req, event);
    if (!nextRes) {
      return nextRes;
    }

    if (updatedSession && !nextRes.headers.has("set-cookie")) {
      console.log("update refreshed session on response");
      options.sessionManager.saveSession(updatedSession, nextRes);
    } else if (refreshError) {
      options.sessionManager.deleteSession(nextRes);

      console.log("Set logged-out cookie");

      const cookies = new ResponseCookies(nextRes.headers);
      cookies.set("next-session__logged-out", "reason:unknown");
    }

    return nextRes;
  };
};
