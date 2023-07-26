import type { NextSessionCookie } from "session-cookie";

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export interface UnauthenticatedClientSession {
  authenticated: false;
}

export interface AuthenticatedClientSession {
  userId: string;
  authenticated: true;
}

export type ClientSession =
  | AuthenticatedClientSession
  | UnauthenticatedClientSession;

export interface UnauthenticatedServerSession extends UnauthenticatedClientSession { }
export interface AuthenticatedServerSession extends AuthenticatedClientSession {
  tokenResponse: TokenResponse;
}

export type ServerSession =
  | AuthenticatedServerSession
  | UnauthenticatedServerSession;

declare module "session-cookie" {
  interface NextSessionCookie {
    userId: string;
    tokenResponse: TokenResponse;
  }
}
