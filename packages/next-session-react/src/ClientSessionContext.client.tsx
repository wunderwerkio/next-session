"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { ClientSession } from "@wunderwerk/next-session";

interface ClientSessionContextValue {
  session?: ClientSession;
  loadingSession: boolean;
  clientSessionEndpoint: string;
  requestSession: () => Promise<void>;
}

const ClientSessionContext = createContext<
  ClientSessionContextValue | undefined
>(undefined);

type ClientSessionProviderProps = {
  session?: ClientSession;
  children?: ReactNode;
  clientSessionEndpoint?: string;
};

/**
 * ClientSessionContext Provider Component.
 *
 * @param props - Component props.
 * @param props.session - Session can be passed from RSC.
 * @param props.children - Child components.
 * @param props.clientSessionEndpoint - Path to the route handler to fetch client session.
 */
export const ClientSessionProvider = ({
  session: providedSession,
  children,
  clientSessionEndpoint = "/api/client-session",
}: ClientSessionProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ClientSession | undefined>(
    providedSession,
  );
  const [loadRequested, setLoadRequested] = useState(false);

  const requestSession = async () => {
    setLoadRequested(true);
  };

  const fetchSession = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(clientSessionEndpoint);
      const data = (await response.json()) as ClientSession;

      setSession(data);
    } catch {
      // @todo handle error!
      console.error("Could not fetch client session!");
    }

    setLoading(false);
  }, [clientSessionEndpoint, loading]);

  useEffect(() => {
    if (loadRequested && !session) {
      fetchSession();
    }
  }, [loadRequested, session, fetchSession]);

  // Handle updates via props.
  useEffect(() => {
    if (providedSession) {
      setSession(providedSession);
    }
  }, [providedSession]);

  return (
    <ClientSessionContext.Provider
      value={{
        session,
        loadingSession: loading,
        clientSessionEndpoint,
        requestSession,
      }}
    >
      {children}
    </ClientSessionContext.Provider>
  );
};

/**
 * React hook to get the client session.
 *
 * This requires that the session was passed as prop to
 * the provider.
 *
 * If the session should optionally be fetched, if not passed
 * as a prop to the provider, use `useClientSessionWithFetch` instead.
 */
export const useClientSession = () => {
  const context = useContext(ClientSessionContext);
  invariant(
    context,
    "useClientSession must be used within ClientSessionProvider!",
  );

  invariant(
    context.session,
    "No session was passed to ClientSessionProvider! If this is expected, use useClientSessionWithFetch instead.",
  );

  return context.session;
};

/**
 * React hook to get the client session.
 *
 * If the client session is not provided via the ClientSessionContext,
 * the session is fetched from the route handler.
 */
export const useClientSessionWithFetch = () => {
  const context = useContext(ClientSessionContext);
  invariant(
    context,
    "useClientSession must be used within ClientSessionProvider!",
  );

  useEffect(() => {
    if (!context.session && !context.loadingSession) {
      context.requestSession();
    }
  }, [context, context.session, context.loadingSession]);

  if (context.session && !context.loadingSession) {
    return {
      session: context.session,
      loading: false,
    } as const;
  }

  return {
    session: undefined,
    loading: true,
  } as const;
};
