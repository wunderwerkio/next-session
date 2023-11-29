import test from "ava";
import { NextRequest } from "next/server.js";

import { getSessionCookie } from "../src/getSessionCookie.js";
import { createRequestWithCookie, testOptions } from "./common.js";

test("req - get empty session cookie", async (t) => {
  const req = new Request("http://localhost") as NextRequest;

  const value = await getSessionCookie(testOptions, req);

  t.is(value, null);
});

test("req - handle malformed session cookie", async (t) => {
  const req = createRequestWithCookie(
    testOptions.cookieName,
    "malformed-string",
  );

  await t.throwsAsync(getSessionCookie(testOptions, req));
});

test("req - get value from session cookie", async (t) => {
  const req = createRequestWithCookie(
    testOptions.cookieName,
    "Fe26.2**dfad6d980c99050f3b4639d1e8a360c880c090a51fc006fa2d5f8487465eaa23*4pI2ij7vRtUqKFehTHmL4w*kF-Jvo_GLKciyw7ABcj0QFkgkfI6Db20j0lnJvUBQWQ**7920cd3523da012ff34acc2deec3b69c5b15ecb85785e0efb3313a40a5a2ff3f*Cruxyu2xvoYC1TgKLeVMfTVsOQ_OLnyeFktTnRp75X4",
  );

  const value = await getSessionCookie(testOptions, req);

  t.deepEqual(value, {
    hello: "world",
  });
});

test("func - get empty session cookie", async (t) => {
  const value = await getSessionCookie({
    ...testOptions,
    // @ts-ignore
    nextCookiesFunc: () => ({
      get: () => undefined,
    }),
  });

  t.is(value, null);
});

test("func - handle malformed session cookie", async (t) => {
  await t.throwsAsync(
    getSessionCookie({
      ...testOptions,
      // @ts-ignore
      nextCookiesFunc: () => ({
        get: (name) => ({ name, value: "malformed-string" }),
      }),
    }),
  );
});

test("func - get value from session cookie", async (t) => {
  const cookieValue =
    "Fe26.2**dfad6d980c99050f3b4639d1e8a360c880c090a51fc006fa2d5f8487465eaa23*4pI2ij7vRtUqKFehTHmL4w*kF-Jvo_GLKciyw7ABcj0QFkgkfI6Db20j0lnJvUBQWQ**7920cd3523da012ff34acc2deec3b69c5b15ecb85785e0efb3313a40a5a2ff3f*Cruxyu2xvoYC1TgKLeVMfTVsOQ_OLnyeFktTnRp75X4";

  const value = await getSessionCookie({
    ...testOptions,
    // @ts-ignore
    nextCookiesFunc: () => ({
      get: (name) => ({ name, value: cookieValue }),
    }),
  });

  t.deepEqual(value, {
    hello: "world",
  });
});
