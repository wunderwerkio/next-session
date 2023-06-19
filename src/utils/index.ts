import { IronSession } from "iron-session";
import { decodeJwt } from "jose";

import {
  ClientSession,
  ReadonlyServerSession,
  ServerSession,
} from "../types/index.js";

export const cookieRegex =
  /(?<cookieName>^[a-zA-Z0-9\-_]+)=(?<cookieValue>[^;]+).*/gm;

/**
 * Checks if given JWT is expired.
 *
 * @param token - the JWT to check.
 */
export const isTokenExpired = (token: string) => {
  const decoded = decodeJwt(token);
  if (!decoded || typeof decoded === "string") {
    return true;
  }

  const expires = (decoded.exp ?? 0) * 1000;

  return Date.now() > expires - 5000;
};

/**
 * Create a server session from a iron session.
 *
 * @param ironSession - The iron session object.
 */
export const createServerSession = (
  ironSession: IronSession
): ServerSession => {
  const session = ironSession as ServerSession;

  session.authenticated = "tokenResponse" in session;

  return session;
};

/**
 * Create a readonly session from a server session.
 *
 * @param session - The server session object.
 */
export const createReadOnlySession = (
  session: ServerSession
): ReadonlyServerSession => {
  const readonlySession = { ...session } as ReadonlyServerSession;
  if ("save" in readonlySession) {
    delete readonlySession.save;
  }
  if ("destroy" in readonlySession) {
    delete readonlySession.destroy;
  }

  return readonlySession;
};

/**
 * Create a client session from a readonly server session.
 */
export const clientSession = (session: ReadonlyServerSession) => {
  const clientSession = { ...session } as ClientSession;
  if ("tokenResponse" in clientSession) {
    delete clientSession.tokenResponse;
  }

  return clientSession;
};
