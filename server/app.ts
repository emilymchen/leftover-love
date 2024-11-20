import AuthenticatingConcept from "./concepts/authenticating";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import MessagingConcept from "./concepts/messaging";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Messaging = new MessagingConcept("messages");
