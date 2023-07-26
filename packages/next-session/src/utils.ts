import { decodeJwt } from "jose";

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
