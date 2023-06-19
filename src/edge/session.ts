import { getIronSession } from "iron-session/edge";

import { SessionOptions } from "../types/index.js";
import { createServerSession } from "../utils/index.js";

export const getSessionFromRequest = async (
  request: Request,
  response: Response,
  sessionOptions: SessionOptions
) => {
  const ironSession = await getIronSession(request, response, sessionOptions);

  return createServerSession(ironSession);
};
