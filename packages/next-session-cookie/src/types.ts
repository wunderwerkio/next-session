import { ResponseCookie } from "@edge-runtime/cookies";
import { SealOptions } from "iron-webcrypto";
import { cookies } from "next/headers.js";
import { NextRequest, NextResponse } from "next/server.js";

export type Req = NextRequest;
export type Res = Response | NextResponse;

export interface NextSessionCookie {}

export interface NextSessionCookieOptions {
  cookieName: string;
  password: string;
  sealOptions?: SealOptions;
  cookieOptions?: Omit<ResponseCookie, "name" | "value">;
  nextCookiesFunc?: typeof cookies;
}
