import { getIronSession } from "iron-session/edge";

import { SessionOptions } from "../types/index.js";
import { createServerSession } from "../utils/index.js";

/**
 * Get session from request.
 *
 * @param request - The incoming request.
 * @param response - The outgoing response.
 * @param sessionOptions - The iron-session options.
 */
export const getSessionFromRequest = async (
  request: Request,
  response: Response,
  sessionOptions: SessionOptions
) => {
  const ironSession = await getIronSession(request, response, sessionOptions);

  return createServerSession(ironSession);
};
