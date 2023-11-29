import { RequestCookies } from "@edge-runtime/cookies";
import { defaults as sealDefaults, unseal } from "iron-webcrypto";
import { cookies } from "next/headers.js";
import crypto from "uncrypto";

import { NextSessionCookie, NextSessionCookieOptions, Req } from "./types.js";

// Hashmap of previously unsealed cookie values.
const unsealHashMap = new Map<string, NextSessionCookie>();

/**
 * Get the unsealed session cookie payload.
 *
 * @param options - Cookie options.
 * @param req - Optional request object.
 * @throws Will throw an error if cookie cannot be unsealed.
 */
export const getSessionCookie = async (
  options: NextSessionCookieOptions,
  req?: Req,
): Promise<NextSessionCookie | null> => {
  const sealedPayload = req
    ? await getFromRequest(req, options)
    : await getViaFunction(options);
  if (!sealedPayload) {
    return null;
  }

  return await unsealCookieValue(sealedPayload, options);
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

/**
 * Unseals cookie value into payload.
 *
 * Previously unsealed cookie payloads will be cached
 * to improve performance.
 *
 * @param sealedPayload - The sealed cookie value.
 * @param options - Cookie options.
 * @throws Will throw an error if cookie cannot be unsealed.
 */
const unsealCookieValue = async (
  sealedPayload: string,
  options: NextSessionCookieOptions,
) => {
  // Check cache.
  if (unsealHashMap.has(sealedPayload)) {
    return unsealHashMap.get(sealedPayload) as NextSessionCookie;
  }

  // Actual unseal.
  const payload = (await unseal(
    crypto,
    sealedPayload,
    options.password,
    options.sealOptions ?? sealDefaults,
  )) as NextSessionCookie;

  // Cache result.
  unsealHashMap.set(sealedPayload, payload);

  return payload;
};
