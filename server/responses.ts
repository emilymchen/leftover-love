import { Authing } from "./app";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/posting";
import { Router } from "./framework/router";
import { MessageSenderNotMatchError, MessageDoc } from "./concepts/messaging";

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
