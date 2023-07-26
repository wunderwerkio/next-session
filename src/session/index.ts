import { NextRequest, NextResponse } from "next/server.js"
import { CookieSessionOptions } from "../index.ts"

type Options = {
  req?: Request | NextRequest,
  res?: Response | NextResponse,
  sessionOptions: CookieSessionOptions;
}

interface CookieSession {
  payload: unknown;
  destroy: () => void;
  save: () => Promise<void>;
}

const retrieveExistingSession = (req: Options['req']) => {
  if (req) {
    req.headers.get('')
  }
}

export const getCookieSession = ({ req, res, sessionOptions }: Options) => {

}
