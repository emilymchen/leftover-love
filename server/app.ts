import AuthenticatingConcept from "./concepts/authenticating";
import ClaimingConcept from "./concepts/claiming";
import MessagingConcept from "./concepts/messaging";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Messaging = new MessagingConcept("messages");
export const Claiming = new ClaimingConcept("claims");
