import type { IronSession, IronSessionOptions } from "iron-session";

export interface ClientSession {
  authenticated: boolean;
}

export interface ReadonlyServerSession extends ClientSession {
  tokenResponse?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ServerSession extends IronSession, ReadonlyServerSession {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SessionOptions extends IronSessionOptions {}
