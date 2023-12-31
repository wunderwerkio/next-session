import { NextRequest } from "next/server.js";
import {
  createSessionCookieValue,
  deleteSessionCookie,
  getSessionCookie,
  NextSessionCookie,
  NextSessionCookieOptions,
  Req,
  Res,
  saveSessionCookie,
} from "@wunderwerk/next-session-cookie";

import {
  AuthenticatedServerSession,
  ClientSession,
  ServerSession,
} from "./types.js";
import { extractSubFromToken, toClientSession } from "./utils.js";

/**
 * Create a new session manager object.
 *
 * This session manager contains all necessary methods to work with next sessions.
 *
 * @param sessionCookieOptions - Cookie options.
 */
export const createSessionManager = (
  sessionCookieOptions: NextSessionCookieOptions,
) => {
  const getServerSession = async (req?: Req): Promise<ServerSession> => {
    try {
      const sessionCookie = await getSessionCookie(sessionCookieOptions, req);
      if (sessionCookie) {
        return {
          authenticated: true,
          userId: sessionCookie.userId,
          tokenResponse: sessionCookie.tokenResponse,
        };
      }
    } catch (e) {
      console.warn("Could not unseal next-session cookie:", e);

      // eslint-disable-next-line
      return {
        authenticated: false,
        _unsealError: true,
      } as ServerSession;
    }

    return {
      authenticated: false,
    };
  };

  const getClientSession = async (): Promise<ClientSession> => {
    const serverSession = await getServerSession();

    return toClientSession(serverSession);
  };

  const saveSession = async (
    session: AuthenticatedServerSession,
    res?: Res,
  ) => {
    await saveSessionCookie(
      {
        userId: session.userId,
        tokenResponse: session.tokenResponse,
      },
      sessionCookieOptions,
      res,
    );
  };

  const setSessionForNextRequest = async (
    payload: NextSessionCookie,
    req: NextRequest,
  ) => {
    const cookieValue = await createSessionCookieValue(
      payload,
      sessionCookieOptions,
    );

    req.cookies.set(sessionCookieOptions.cookieName, cookieValue);
  };

  const deleteSession = (res?: Res) => {
    deleteSessionCookie(sessionCookieOptions, res);
  };

  const getCookieName = () => {
    return sessionCookieOptions.cookieName;
  };

  return {
    getServerSession,
    getClientSession,
    saveSession,
    deleteSession,
    setSessionForNextRequest,
    getCookieName,
    getSubFromToken: extractSubFromToken,
  };
};

export type SessionManager = ReturnType<typeof createSessionManager>;
