import { decodeJwt } from "jose";

import { ClientSession, ServerSession } from "./types.js";

/**
 * Checks if given JWT is expired.
 *
 * @param token - The JWT to check.
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
 * Extract the subject from given JWT.
 *
 * @param token - JWT string.
 */
export const extractSubFromToken = (token: string) => {
  const decoded = decodeJwt(token);
  if (!decoded || typeof decoded === "string") {
    return null;
  }

  return decoded.sub ?? null;
};

/**
 * Create a client session from a server session.
 *
 * @param serverSession - The server session.
 */
export const toClientSession = (
  serverSession: ServerSession,
): ClientSession => {
  const clonedSession = { ...serverSession };

  if ("tokenResponse" in clonedSession) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete clonedSession.tokenResponse;
  }

  return clonedSession;
};
