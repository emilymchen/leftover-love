import { SessionData } from "express-session";
import { ObjectId } from "mongodb";
import { NotAllowedError, UnauthenticatedError } from "./errors";

export type SessionDoc = SessionData;

// This allows us to overload express session data type.
// Express session does not support non-string values over requests.
// We'll be using this to store the user _id in the session.
declare module "express-session" {
  export interface SessionData {
    user?: string;
  }
}

/**
 * concept: Sessioning [User]
 */
export default class SessioningConcept {
  start(session: SessionDoc, user: ObjectId) {
    this.isLoggedOut(session);
    session.user = user.toString();
  }

  end(session: SessionDoc) {
    this.isLoggedIn(session);
    session.user = undefined;
  }

  getUser(session: SessionDoc) {
    this.isLoggedIn(session);
    return new ObjectId(session.user);
  }

  isLoggedIn(session: SessionDoc) {
    if (session.user === undefined) {
      throw new UnauthenticatedError("Must be logged in!");
    }
  }

  isLoggedOut(session: SessionDoc) {
    if (session.user !== undefined) {
      throw new NotAllowedError("Must be logged out!");
    }
  }
}
