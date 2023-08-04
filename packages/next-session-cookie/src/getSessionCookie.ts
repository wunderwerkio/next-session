import { cookies } from "next/headers.js";
import crypto from "uncrypto";
import { RequestCookies } from "@edge-runtime/cookies";
import { unseal, defaults as sealDefaults } from "iron-webcrypto";
import { NextSessionCookie, NextSessionCookieOptions, Req } from "./types.js";

/**
 * Get the unsealed session cookie payload.
 *
 * @param options - Cookie options.
 * @param req - Optional request object.
 */
export const getSessionCookie = async (
  options: NextSessionCookieOptions,
  req?: Req
): Promise<NextSessionCookie | null> => {
  const sealedPayload = req
    ? await getFromRequest(req, options)
    : await getViaFunction(options);
  if (!sealedPayload) {
    return null;
  }

  try {
    const payload = (await unseal(
      crypto,
      sealedPayload,
      options.password,
      options.sealOptions ?? sealDefaults
    )) as NextSessionCookie;

    return payload;
  } catch (e) {
    console.warn("Could not unseal session cookie:", (e as Error)?.message);

    return null;
  }
};

/**
 * Get session cookie value directly from request.
 *
 * @param req - Request object.
 * @param options - Cookie options.
 */
const getFromRequest = async (req: Req, options: NextSessionCookieOptions) => {
  const reqCookies = new RequestCookies(req.headers);

  const sealedPayload = reqCookies.get(options.cookieName);
  if (!sealedPayload) {
    return null;
  }

  return sealedPayload.value;
};

/**
 * Get session cookie value via cookies() function.
 *
 * @param options - Cookie options.
 */
const getViaFunction = async (options: NextSessionCookieOptions) => {
  const cookiesFunc = options.nextCookiesFunc ?? cookies;

  const cookie = cookiesFunc().get(options.cookieName);
  if (!cookie) {
    return null;
  }

  return cookie.value;
};
