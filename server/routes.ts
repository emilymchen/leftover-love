import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Claiming, Messaging, Posting, Sessioning } from "./app";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string, role: string, location?: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password, role, location);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.patch("/users/address")
  async updateAddress(session: SessionDoc, address: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateLocation(user, address);
  }

  @Router.get("/user-role")
  async getUserRole(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserRole(user);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.get("/posts/user")
  async getUserPosts(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return Responses.posts(await Posting.getByAuthor(user));
  }

  /**
   * Creates a food donation post with the given food item, expiration time, quantity, and tags.
   * @param session  the session of the user, the user must be a donor
   * @param food_item  the name of the food item
   * @param expiration_time  the expiration time of the food item, must be in the future
   * @param quantity the quantity of the food item
   * @param t  the tags of the food item
   * @returns the created post
   */
  @Router.post("/posts")
  async createPost(session: SessionDoc, food_item: string, expiration_time: Date, quantity: number) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, food_item, expiration_time, quantity);
    await Authing.assertIsRole(user, "Donor");
    // TODO: Add tags
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, food_item?: string, expiration_time?: Date, quantity?: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Authing.assertIsRole(user, "Donor");
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, food_item, expiration_time, quantity);
  }

  /**
   * Deletes a post with the given id and the associated claims, deliveries, and tags.
   * @param session  the session of the user, the user must be a donor and the author of the post
   * @param id the id of the post to delete
   */
  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Authing.assertIsRole(user, "Donor");
    await Posting.assertAuthorIsUser(oid, user);
    await Claiming.deleteClaim(oid);
    //TODO: Add in delivery, & tag syncs
    return Posting.delete(oid);
  }

  /**
   * Gets all non-expired posts.
   * @returns all non-expired posts
   */
  async getAllNonExpiredPosts() {
    return Posting.getPosts().then((posts) => posts.filter((post) => !Posting.isPostExpired(post._id)));
  }

  /**
   * Gets all non-expired and non-claimed posts.
   * @returns all posts that are both non-expired and non-claimed
   */
  async getAllNonExpiredNonClaimedPosts() {
    return Posting.getPosts().then((posts) => posts.filter((post) => !Posting.isPostExpired(post._id) && !Claiming.isItemClaimed(post._id)));
  }

  /**
   * Creates a pickup claim.
   * @param session The session of the user, the user must be a recipient
   * @param post The post id.
   * @returns The created claim.
   */
  async createPickupClaim(session: SessionDoc, post: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(post);
    await Authing.assertIsRole(user, "Recipient");
    await Posting.assertPostIsNotExpired(oid);
    await Claiming.assertIsNotClaimed(oid);
    return Claiming.createPickupClaim(user, oid);
  }

  /**
   * Creates a delivery claim.
   * @param session The session of the user, the user must be a recipient
   * @param post The post id
   * @param address The address of the recipient.
   * @returns The created claim.
   */
  async createDeliveryClaim(session: SessionDoc, post: string, address: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(post);
    await Authing.assertIsRole(user, "Recipient");
    await Posting.assertPostIsNotExpired(oid);
    await Claiming.assertIsNotClaimed(oid);
    return Claiming.createDeliveryClaim(user, oid, address);
  }

  /**
   * Deletes claim.
   * @param session the session of the user, the user must be a recipient
   * @param post the post id of the food item
   * @returns message of deleted claim
   */
  async deleteClaim(session: SessionDoc, post: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(post);
    await Authing.assertIsRole(user, "Recipient");
    await Claiming.assertClaimerIsUser(oid, user);
    //TODO: Add in delivery sync
    return Claiming.deleteClaim(oid);
  }

  /**
   * Completes a pickup claim.
   * @param session The session of the user, the user must be a recipient
   * @param claim The claim id
   * @returns A message of the completed claim
   */
  async pickupClaim(session: SessionDoc, claim: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(claim);
    await Authing.assertIsRole(user, "Recipient");
    await Claiming.assertClaimerIsUser(oid, user);
    await Claiming.assertIsPickupClaim(oid);
    return Claiming.completeClaim(oid);
  }

  /**
   * Gets claims by user.
   * @param session the session of the user
   * @returns the claims by the user
   */
  async getUserClaims(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return Claiming.getClaimsByUser(user);
  }

  /**
   * Gets the claimer of the post.
   * @param post The post id
   * @returns the user who claimed the post
   */
  async getPostClaimer(post: string) {
    const oid = new ObjectId(post);
    return Claiming.getItemClaimer(oid);
  }

  @Router.get("/messages")
  @Router.validate(z.object({ currentUser: z.string(), otherUser: z.string() }))
  async getMessages(currentUser: string, otherUser: string) {
    const currentUser_id = (await Authing.getUserByUsername(currentUser))._id;
    const otherUser_id = (await Authing.getUserByUsername(otherUser))._id;
    const sent_messages = await Messaging.getMessagesByUser(currentUser_id, otherUser_id);
    const received_messages = await Messaging.getMessagesByUser(otherUser_id, currentUser_id);
    const all_messages = sent_messages.concat(received_messages);
    const sorted_messages = all_messages.sort((a, b) => a.time.getTime() - b.time.getTime());
    return Responses.messages(sorted_messages);
  }

  /**
   *  Sends a message from the current session user to the given username.
   *  If the user's message activity is being tracked, a record is created as well.
   *
   * @param session  the session of the user, the user must be allowed to message
   * @param to the username of the user to send the message to, user must exist and be allowed to message, to != from
   * @param content the text of the message
   * @returns the created message
   */
  @Router.post("/messages")
  async sendMessage(session: SessionDoc, to: string, content: string) {
    const receiver = (await Authing.getUserByUsername(to))._id;
    const sender = Sessioning.getUser(session);
    const created = await Messaging.send(receiver, sender, content);
    return { msg: created.msg, message: await Responses.message(created.message) };
  }

  /**
   *  Deletes a message with the given id.
   *
   * @param session the session of the user, the user must be allowed to message and be the sender of the message
   * @param id the message id
   */
  @Router.delete("/messages/:id")
  async deleteMessage(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Messaging.assertSenderIsUser(oid, user);
    return Messaging.delete(oid);
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
