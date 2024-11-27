import { Authing, Claiming, Posting, Delivering } from "./app";
import { ClaimDoc } from "./concepts/claiming";
import { DeliveryDoc } from "./concepts/delivering";
import { MessageDoc, MessageSenderNotMatchError } from "./concepts/messaging";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/posting";
import { ClaimUserNotMatchError } from "./concepts/claiming";
import { DelivererNotMatchError } from "./concepts/delivering";
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
    const claimedItem = await Claiming.getClaimItem(claim._id);
    const expiration_time = await Posting.getExpirationTime(claim._id);
    const postUser = claimedItem ? (await Authing.getUserById(await Posting.getAuthor(claimedItem))).username : null;
    const food_name = claimedItem ? await Posting.getFoodName(claimedItem) : null;
    const quantity = claimedItem ? await Posting.getQuantity(claimedItem) : null;
    const address = claimedItem ? await Authing.getUserAddress(await Posting.getAuthor(claimedItem)) : null;
    return { ...claim, claimUser: claimUser.username, postUser, expiration_time, food_name, quantity, address };
  }

  /**
   * Same as {@link claim} but for an array of ClaimDoc for improved performance.
   */
  static async claims(claims: ClaimDoc[]) {
    const claimUsers = await Authing.idsToUsernames(claims.map((claim) => claim.claimUser));
    const claimsWithDetails = await Promise.all(
      claims.map(async (claim, i) => {
        const claimedItem = await Claiming.getClaimItem(claim._id);
        const expiration_time = claimedItem ? await Posting.getExpirationTime(claimedItem) : null;
        const postUser = claimedItem ? (await Authing.getUserById(await Posting.getAuthor(claimedItem))).username : null;
        const food_name = claimedItem ? await Posting.getFoodName(claimedItem) : null;
        const quantity = claimedItem ? await Posting.getQuantity(claimedItem) : null;
        const address = claimedItem ? await Authing.getUserAddress(await Posting.getAuthor(claimedItem)) : null;
        return {
          ...claim,
          claimUser: claimUsers[i],
          postUser: postUser,
          expiration_time,
          food_name: food_name,
          quantity: quantity,
          address: address,
        };
      }),
    );
    return claimsWithDetails;
  }

  /**
   * Convert DeliveryDoc into more readable format for the frontend by converting the deliverer id into a username.
   */
  static async delivery(delivery: DeliveryDoc | null) {
    if (!delivery) {
      return delivery;
    }
    const deliverer = await Authing.getUserById(delivery.deliverer);
    const deliveryClaim = await Delivering.getClaim(delivery._id);
    const claimedItem = await Claiming.getClaimItem(deliveryClaim);
    const expiration_time = claimedItem ? await Posting.getExpirationTime(claimedItem) : null;
    const claimUser = claimedItem ? await Claiming.getClaimUser(deliveryClaim) : null;
    const postUser = claimedItem ? (await Authing.getUserById(await Posting.getAuthor(claimedItem))).username : null;
    const food_name = claimedItem ? await Posting.getFoodName(claimedItem) : null;
    const quantity = claimedItem ? await Posting.getQuantity(claimedItem) : null;
    const address = claimedItem ? await Authing.getUserAddress(await Posting.getAuthor(claimedItem)) : null;
    return { ...delivery, deliverer: deliverer.username, claimUser, postUser, expiration_time, food_name, quantity, address };
  }

  /**
   * Same as {@link delivery} but for an array of DeliveryDoc for improved performance.
   */
  static async deliveries(deliveries: DeliveryDoc[]) {
    const deliverers = await Authing.idsToUsernames(deliveries.map((delivery) => delivery.deliverer));
    const deliveriesWithDetails = await Promise.all(
      deliveries.map(async (delivery, i) => {
        const deliveryClaim = await Delivering.getClaim(delivery._id);
        const claimedItem = await Claiming.getClaimItem(deliveryClaim);
        const expiration_time = claimedItem ? await Posting.getExpirationTime(claimedItem) : null;
        const claimUser = claimedItem ? await Claiming.getClaimUser(deliveryClaim) : null;
        const postUser = claimedItem ? (await Authing.getUserById(await Posting.getAuthor(claimedItem))).username : null;
        const food_name = claimedItem ? await Posting.getFoodName(claimedItem) : null;
        const quantity = claimedItem ? await Posting.getQuantity(claimedItem) : null;
        const address = claimedItem ? await Authing.getUserAddress(await Posting.getAuthor(claimedItem)) : null;
        return {
          ...delivery,
          claimUser: claimUser,
          postUser: postUser,
          deliverer: deliverers[i],
          expiration_time,
          food_name: food_name,
          quantity: quantity,
          address: address,
        };
      }),
    );

    return deliveriesWithDetails;
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

Router.registerError(ClaimUserNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.claimUser)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(DelivererNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.deliverer)).username;
  return e.formatWith(username, e._id);
});
