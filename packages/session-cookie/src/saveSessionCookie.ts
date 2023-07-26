import { ResponseCookies } from "@edge-runtime/cookies";
import { seal, defaults as sealDefaults } from "@hapi/iron";
import { NextSessionCookie, NextSessionCookieOptions, Res } from "./types.js";
import { cookies } from "next/headers.js";

/**
 * Save payload in session cookie.
 */
export const saveSessionCookie = async (
  payload: NextSessionCookie,
  options: NextSessionCookieOptions,
  res?: Res
) => {
  const sealedValue = await createSessionCookieValue(payload, options);

  if (res) {
    return await saveOnResponse(sealedValue, res, options);
  }

  return await saveViaFunction(sealedValue, options);
};

/**
 * Create the encrypted cookie value.
 */
export const createSessionCookieValue = async (
  payload: NextSessionCookie,
  options: NextSessionCookieOptions
) => {
  return await seal(
    payload,
    options.password,
    options.sealOptions ?? sealDefaults
  );
};

/**
 * Set cookie as header on response.
 */
const saveOnResponse = async (
  value: string,
  res: Res,
  options: NextSessionCookieOptions
) => {
  const resCookies = new ResponseCookies(res.headers);
  resCookies.set(options.cookieName, value, options.cookieOptions);
};

/**
 * Save cookie via cookies() function.
 *
 * NOTE: This only works in server actions and route handlers!
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
 */
const saveViaFunction = async (
  value: string,
  options: NextSessionCookieOptions
) => {
  const cookiesFunc = options.nextCookiesFunc ?? cookies;

  cookiesFunc().set(options.cookieName, value, options.cookieOptions);
};
