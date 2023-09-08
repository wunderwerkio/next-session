import {
  NextSessionCookie,
  NextSessionCookieOptions,
  Req,
  Res,
  createSessionCookieValue,
  deleteSessionCookie,
  getSessionCookie,
  saveSessionCookie,
} from "@wunderwerk/next-session-cookie";
import { NextRequest } from "next/server.js";

import {
  AuthenticatedServerSession,
  ClientSession,
  ServerSession,
} from "./types.js";
import { extractSubFromToken } from "./utils.js";

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
    const sessionCookie = await getSessionCookie(sessionCookieOptions, req);
    if (!sessionCookie) {
      return {
        authenticated: false,
      };
    }

    return {
      authenticated: true,
      userId: sessionCookie.userId,
      tokenResponse: sessionCookie.tokenResponse,
    };
  };

  const getClientSession = async (): Promise<ClientSession> => {
    const serverSession = await getServerSession();

    if ("tokenResponse" in serverSession) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete serverSession.tokenResponse;
    }

    return serverSession;
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
