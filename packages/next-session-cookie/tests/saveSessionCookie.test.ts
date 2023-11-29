import test from "ava";

import { saveSessionCookie } from "../src/saveSessionCookie.js";
import { testOptions } from "./common.js";

test("res - save payload to session cookie of response", async (t) => {
  const payload = {
    hello: "world",
  };

  const res = new Response();

  await saveSessionCookie(payload, testOptions, res);

  t.assert(res.headers.has("set-cookie"));

  const headerValue = res.headers.get("set-cookie");
  t.assert(headerValue?.startsWith(testOptions.cookieName));
  t.assert(headerValue?.includes("=Fe26.2**"));
  t.assert(headerValue?.endsWith("Path=/"));

  // Must not contain.
  t.assert(!headerValue?.includes("Max-Age"));
  t.assert(!headerValue?.includes("Expires"));
});

test("res - payload with custom cookie options", async (t) => {
  const payload = {
    hello: "world",
  };

  const res = new Response();

  await saveSessionCookie(
    payload,
    {
      ...testOptions,
      cookieOptions: {
        domain: "domain.org",
        path: "/path",
        secure: true,
        httpOnly: true,
        priority: "high",
        sameSite: "lax",
        maxAge: 900,
      },
    },
    res,
  );

  const headerValue = res.headers.get("set-cookie");

  t.assert(headerValue?.startsWith(testOptions.cookieName));
  t.assert(headerValue?.includes("=Fe26.2**"));
  t.assert(headerValue?.includes("Path=/path;"));
  t.assert(headerValue?.includes("Secure;"));
  t.assert(headerValue?.includes("Domain=domain.org;"));
  t.assert(headerValue?.includes("HttpOnly;"));
  t.assert(headerValue?.includes("Expires="));
  t.assert(headerValue?.includes("Max-Age=900;"));
  t.assert(headerValue?.includes("SameSite=lax"));
});

test("func - save payload to session cookie of response", async (t) => {
  const payload = {
    hello: "world",
  };

  t.plan(2);

  await saveSessionCookie(payload, {
    ...testOptions,
    // eslint-disable-next-line
    // @ts-ignore
    nextCookiesFunc: () => ({
      set: (name, value) => {
        t.is(name, testOptions.cookieName),
          t.assert(value?.includes("Fe26.2**"));
      },
    }),
  });
});
