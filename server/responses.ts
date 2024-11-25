import { Authing } from "./app";
import { ClaimDoc } from "./concepts/claiming";
import { MessageDoc, MessageSenderNotMatchError } from "./concepts/messaging";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/posting";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link PostDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await Authing.getUserById(post.author);
    return { ...post, author: author.username };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await Authing.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  /**
   * Convert ClaimDoc into more readable format for the frontend by converting the claimUser id into a username.
   */
  static async claim(claim: ClaimDoc | null) {
    if (!claim) {
      return claim;
    }
    const claimUser = await Authing.getUserById(claim.claimUser);
    return { ...claim, claimUser: claimUser.username };
  }

  /**
   * Same as {@link claim} but for an array of ClaimDoc for improved performance.
   */
  static async claims(claims: ClaimDoc[]) {
    const claimUsers = await Authing.idsToUsernames(claims.map((claim) => claim.claimUser));
    return claims.map((claim, i) => ({ ...claim, claimUser: claimUsers[i] }));
  }

  /**
   * Convert MessageDoc into more readable format for the frontend by converting the sender/receiver id into a username.
   */
  static async message(message: MessageDoc | null) {
    console.log(message);
    if (!message) {
      return message;
    }
    const sender = await Authing.getUserById(message.from);
    const receiver = await Authing.getUserById(message.to);
    return { ...message, to: receiver.username, from: sender.username };
  }

  /**
   * Same as {@link message} but for an array of MessageDoc for improved performance.
   */
  static async messages(messages: MessageDoc[]) {
    const senders = await Authing.idsToUsernames(messages.map((message) => message.from));
    const receivers = await Authing.idsToUsernames(messages.map((message) => message.to));
    return messages.map((message, i) => ({ ...message, from: senders[i], to: receivers[i] }));
  }
}

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(MessageSenderNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.sender)).username;
  return e.formatWith(username, e._id);
});
