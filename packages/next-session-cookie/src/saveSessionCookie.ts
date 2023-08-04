import crypto from "uncrypto";
import { ResponseCookies } from "@edge-runtime/cookies";
import { seal, defaults as sealDefaults } from "iron-webcrypto";
import { NextSessionCookie, NextSessionCookieOptions, Res } from "./types.js";
import { cookies } from "next/headers.js";

/**
 * Save payload in session cookie.
 *
 * @param payload - Session cookie payload.
 * @param options - Cookie options.
 * @param res - Optional response object.
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
 *
 * @param payload - Session cookie payload.
 * @param options - Cookie options.
 */
export const createSessionCookieValue = async (
  payload: NextSessionCookie,
  options: NextSessionCookieOptions
) => {
  return await seal(
    crypto,
    payload,
    options.password,
    options.sealOptions ?? sealDefaults
  );
};

/**
 * Set cookie as header on response.
 *
 * @param value - Cookie value.
 * @param res - Response object.
 * @param options - Cookie options.
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
 * @param value - Cookie value.
 * @param options - Cookie options.
 */
const saveViaFunction = async (
  value: string,
  options: NextSessionCookieOptions
) => {
  const cookiesFunc = options.nextCookiesFunc ?? cookies;

  cookiesFunc().set(options.cookieName, value, options.cookieOptions);
};
