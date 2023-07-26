import {
    NextSessionCookie,
  NextSessionCookieOptions,
  Req,
  Res,
  createSessionCookieValue,
  deleteSessionCookie,
  getSessionCookie,
  saveSessionCookie,
} from "session-cookie";
import {
  AuthenticatedServerSession,
  ClientSession,
  ServerSession,
} from "./types.js";
import { NextRequest } from "next/server.js";

export const createSessionManager = (
  sessionCookieOptions: NextSessionCookieOptions
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
      // @ts-ignore
      delete serverSession.tokenResponse;
    }

    return serverSession;
  };

  const saveSession = async (
    session: AuthenticatedServerSession,
    res?: Res
  ) => {
    await saveSessionCookie(
      {
        userId: session.userId,
        tokenResponse: session.tokenResponse,
      },
      sessionCookieOptions,
      res
    );
  };

  const setSessionForNextRequest = async (
    payload: NextSessionCookie,
    req: NextRequest
  ) => {
    const cookieValue = await createSessionCookieValue(payload, sessionCookieOptions);

    req.cookies.set(sessionCookieOptions.cookieName, cookieValue);
  }

  const deleteSession = (res?: Res) => {
    deleteSessionCookie(sessionCookieOptions, res);
  };

  const getCookieName = () => {
    return sessionCookieOptions.cookieName;
  }

  return {
    getServerSession,
    getClientSession,
    saveSession,
    deleteSession,
    setSessionForNextRequest,
    getCookieName
  };
};

export type SessionManager = ReturnType<typeof createSessionManager>;
