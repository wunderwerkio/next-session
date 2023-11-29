import { ResponseCookies } from "@edge-runtime/cookies";
import {
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from "next/server.js";

import { SessionManager } from "./sessionManager.js";
import { AuthenticatedServerSession } from "./types.js";
import { isTokenExpired } from "./utils.js";

type UpdateSessionCallback = (
  session: AuthenticatedServerSession,
) => Promise<AuthenticatedServerSession | Error>;

type Options = {
  sessionManager: SessionManager;
  updateSession: UpdateSessionCallback;
};

/**
 * NextJS Middleware higher-order function that adds session handling to all routes.
 *
 * @param options - Configuration options.
 */
export const withMiddlewareSession =
  (options: Options) => (next: NextMiddleware) => {
    return async (req: NextRequest, event: NextFetchEvent) => {
      // Retrieve session.
      const session = await options.sessionManager.getServerSession(req);

      let refreshError: Error | null = null;
      let updatedSession: AuthenticatedServerSession | null = null;

      if (
        session.authenticated &&
        isTokenExpired(session.tokenResponse.accessToken)
      ) {
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
        await options.sessionManager.saveSession(updatedSession, nextRes);
      } else if (refreshError || "") {
        options.sessionManager.deleteSession(nextRes);

        console.log("Set logged-out cookie");

        const cookies = new ResponseCookies(nextRes.headers);
        cookies.set("next-session__logged-out", "reason:unknown");
      } else if ("_unsealError" in session) {
        options.sessionManager.deleteSession(nextRes);
      }

      return nextRes;
    };
  };
