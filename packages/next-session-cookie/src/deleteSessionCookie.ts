import { ResponseCookies } from "@edge-runtime/cookies";
import { NextSessionCookieOptions, Res } from "./types.js";
import { cookies } from "next/headers.js";

/**
 * Save payload in session cookie.
 *
 * @param options - Cookie options.
 * @param res - Optional response object.
 */
export const deleteSessionCookie = (
  options: NextSessionCookieOptions,
  res?: Res
) => {
  if (res) {
    return deleteOnResponse(res, options);
  }

  return deleteViaFunction(options);
};

/**
 * Delete cookie as header on response.
 *
 * @param res - Optional response object.
 * @param options - Cookie options.
 */
const deleteOnResponse = (res: Res, options: NextSessionCookieOptions) => {
  const resCookies = new ResponseCookies(res.headers);
  resCookies.delete(options.cookieName);
};

/**
 * Delete cookie via cookies() function.
 *
 * NOTE: This only works in server actions and route handlers!
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies#deleting-cookies
 * @param options - Cookie options.
 */
const deleteViaFunction = (options: NextSessionCookieOptions) => {
  const cookiesFunc = options.nextCookiesFunc ?? cookies;

  cookiesFunc().delete(options.cookieName);
};
