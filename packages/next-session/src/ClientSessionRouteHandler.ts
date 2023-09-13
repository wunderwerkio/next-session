import { SessionManager } from "./sessionManager.js";

/**
 * Creates a NextJS route handler to requests to get the client session.
 *
 * @param sessionManager - Session manager instance of the project.
 */
export const createClientSessionRouteHandler = (
  sessionManager: SessionManager,
) => {
  return {
    async GET() {
      const session = await sessionManager.getClientSession();

      return new Response(JSON.stringify(session), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  };
};
