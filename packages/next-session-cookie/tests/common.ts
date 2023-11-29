import { RequestCookies } from "@edge-runtime/cookies";
import { NextRequest } from "next/server.js";

import { NextSessionCookieOptions } from "../src/index.js";

export const testOptions: NextSessionCookieOptions = {
  cookieName: "test__session-cookie",
  password: "WKYWgkjHWtgW7173a4Vt1Jfgk83kAmhn",
};

export const createRequestWithCookie = (name: string, value: string) => {
  const request = new Request("http://localhost");

  const cookies = new RequestCookies(request.headers);
  cookies.set(name, value);

  return request as NextRequest;
};
