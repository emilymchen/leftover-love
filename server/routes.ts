import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Claiming, Delivering, Messaging, Posting, Sessioning, Tagging } from "./app";
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
   * @param food_name  the name of the food item
   * @param expiration_time  the expiration time of the food item, must be in the future
   * @param quantity the quantity of the food item
   * @param tags  the tags of the food item
   * @returns the created post
   */
  @Router.post("/posts")
  async createPost(session: SessionDoc, food_name: string, expiration_time: Date, quantity: number, tags: Array<string>) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, food_name, expiration_time, quantity);
    await Authing.assertIsRole(user, "Donor");
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, food_name?: string, expiration_time?: Date, quantity?: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Authing.assertIsRole(user, "Donor");
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, food_name, expiration_time, quantity);
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
    const deleted_claim = await Claiming.deleteClaim(oid);
    await Delivering.deleteDeliveryByRequest(await deleted_claim.claim);
    //TODO: Add in tag syncs
    return Posting.delete(oid);
  }

  /**
   * Gets all non-expired posts.
   * @returns all non-expired posts, meaning the current time is before the expiration time
   */
  @Router.get("/posts/non-expired")
  async getAllNonExpiredPosts() {
    const posts = await Posting.getPosts();
    const checkPromises = posts.map(async (post) => {
      const isExpired = await Posting.isPostExpired(post._id);
      return { post, isExpired };
    });
    const results = await Promise.all(checkPromises);
    const result = results.filter((result) => !result.isExpired).map((result) => result.post);
    return Responses.posts(result);
  }

  /**
   * Gets all non-expired and non-claimed posts.
   * @returns all posts that are both non-expired and non-claimed by any user
   */
  @Router.get("/posts/non-expired-non-claimed")
  async getAllNonExpiredNonClaimedPosts() {
    const posts = await Posting.getPosts();
    const checkPromises = posts.map(async (post) => {
      const [isExpired, isClaimed] = await Promise.all([Posting.isPostExpired(post._id), Claiming.isItemClaimed(post._id)]);
      return { post, isExpired, isClaimed };
    });
    const results = await Promise.all(checkPromises);
    const result = results.filter((result) => !result.isExpired && !result.isClaimed).map((result) => result.post);
    return Responses.posts(result);
  }

  /**
   * Gets all non-expired and claimed posts.
   * @returns all posts that are both non-expired and claimed
   */
  @Router.get("/posts/non-expired-claimed")
  async getAllNonExpiredClaimedPosts() {
    const posts = await Posting.getPosts();
    const checkPromises = posts.map(async (post) => {
      const [isExpired, isClaimed] = await Promise.all([Posting.isPostExpired(post._id), Claiming.isItemClaimed(post._id)]);
      return { post, isExpired, isClaimed };
    });
    const results = await Promise.all(checkPromises);
    const result = results.filter((result) => !result.isExpired && result.isClaimed).map((result) => result.post);
    return Responses.posts(result);
  }

  /**
   * Creates a pickup claim.
   * @param session The session of the user, the user must be a recipient
   * @param post The post id.
   * @returns The created claim.
   */
  @Router.post("/claims/pickup")
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
   * @returns The created claim.
   */
  @Router.post("/claims/delivery")
  async createDeliveryClaim(session: SessionDoc, post: string, address: string, instructions: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(post);
    await Authing.assertIsRole(user, "Recipient");
    await Posting.assertPostIsNotExpired(oid);
    await Claiming.assertIsNotClaimed(oid);
    return Claiming.createDeliveryClaim(user, oid, address, instructions);
  }

  /**
   * Deletes claim.
   * @param session the session of the user, the user must be a recipient
   * @param post the post id of the food item
   * @returns message of deleted claim
   */
  @Router.delete("/claims/:post")
  async deleteClaim(session: SessionDoc, post: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(post);
    await Authing.assertIsRole(user, "Recipient");
    const claim = await Claiming.getClaimsByItem(oid);
    if (!claim) {
      return { msg: claim + "does not exist!" };
    }
    await Claiming.assertClaimerIsUser(claim._id, user);
    const delivery = await Delivering.getDeliveryByRequest(claim._id);
    if (delivery) {
      await Delivering.assertIsNotStartedDelivery(delivery._id);
    }
    await Delivering.deleteDeliveryByRequest(claim._id);
    return await Claiming.deleteClaim(oid);
  }

  /**
   * Completes a pickup claim.
   * @param session The session of the user, the user must be a recipient
   * @param id The claim id
   * @returns A message of the completed claim
   */
  @Router.patch("/claims/pickup/:claim")
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
   * @returns the claims by the user with full item details packed inside
   */
  @Router.get("/claims")
  async getUserClaims(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const allClaims = await Claiming.getClaimsByUser(user);
    const fullClaims = allClaims.map(async (claim) => {
      const oid = new ObjectId(claim.item);
      const post = await Posting.getById(oid);
      const postWithAuthor = await Responses.post(post);
      return { ...claim, post: postWithAuthor };
    });
    return Responses.claims(await Promise.all(fullClaims));
  }

  /**
   * Gets the claimer of the post.
   * @param post The post id
   * @returns the user who claimed the post
   */
  @Router.get("/claims/:post")
  async getPostClaimer(post: string) {
    const oid = new ObjectId(post);
    return await Claiming.getClaimsByItem(oid);
  }

  /**
   * Creates a delivery claim.
   * @param session The session of the user, the user must be a volunteer
   * @param request The claim request id
   * @returns The created delivery.
   */
  @Router.post("/deliveries")
  async acceptDelivery(session: SessionDoc, request: string) {
    const currentUser = Sessioning.getUser(session);
    const oid = new ObjectId(request);
    await Authing.assertIsRole(currentUser, "Volunteer");
    await Claiming.assertClaimIsNotCompleted(oid);
    await Claiming.assertIsDeliveryClaim(oid);
    return await Delivering.acceptDelivery(currentUser, oid);
  }

  /**
   * Unaccepts a delivery.
   * @param session  the session of the user, the user must be a volunteer and the deliverer of the original delivery
   * @param id the id of the delivery
   * @returns a message of the unaccepted delivery
   */
  @Router.delete("/deliveries/:id")
  async unacceptDelivery(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Authing.assertIsRole(user, "Volunteer");
    await Delivering.assertDelivererIsUser(oid, user);
    await Delivering.assertIsNotStartedDelivery(oid);
    return await Delivering.unacceptDelivery(oid);
  }

  /**
   * Starts a delivery by picking up from the donor.
   * @param session  the session of the user, the user must be a volunteer and the deliverer of the original delivery
   * @param id the id of the delivery
   * @returns a message of the completed delivery
   */
  @Router.post("/deliveries/start/:id")
  async startDelivery(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Authing.assertIsRole(user, "Volunteer");
    await Delivering.assertDelivererIsUser(oid, user);
    await Delivering.assertIsNotStartedDelivery(oid);
    return await Delivering.startDelivery(oid);
  }

  /**
   * Completes a delivery.
   * @param session  the session of the user, the user must be a volunteer and the deliverer of the original delivery
   * @param id the id of the delivery
   * @returns a message of the completed delivery
   */
  @Router.post("/deliveries/complete/:id")
  async completeDelivery(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Delivering.assertIsInProgressDelivery(oid);
    await Authing.assertIsRole(user, "Volunteer");
    await Delivering.assertDelivererIsUser(oid, user);
    await Claiming.completeClaim(await Delivering.getDeliveryRequest(oid));
    return await Delivering.completeDelivery(oid);
  }

  @Router.get("/deliveries")
  @Router.validate(z.object({ deliverer: z.string().optional() }))
  async getDeliveries(deliverer?: string) {
    let deliveries;
    if (deliverer) {
      const id = (await Authing.getUserByUsername(deliverer))._id;
      deliveries = await Delivering.getDeliveriesByUser(id);
    } else {
      deliveries = await Delivering.getDeliveries();
    }
    return Responses.deliveries(await deliveries);
  }

  @Router.get("/deliveries/status/:id")
  async getDeliveryStatus(id: string) {
    const oid = new ObjectId(id);
    const delivery = await Delivering.getDeliveryByRequest(oid);
    return Responses.delivery(delivery);
  }

  /**
   * Gets all non-completed claims available to deliver.
   * This includes all delivery claims that are not completed and have not been claimed by another volunteer.
   */
  @Router.get("/deliveries/requests")
  async getClaimsAvailableToDeliver(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    await Authing.assertIsRole(user, "Volunteer");
    const availableClaims = await Claiming.getIncompleteDeliveryClaims();
    const unclaimedClaims = await Promise.all(
      availableClaims.map(async (claim) => ({
        claim,
        isUnclaimed: !(await Delivering.doesRequestForDeliveryExist(claim._id)),
      })),
    );

    const filteredClaims = unclaimedClaims.filter(({ isUnclaimed }) => isUnclaimed).map(({ claim }) => claim);

    return Responses.claims(filteredClaims);
  }

  @Router.get("/deliveries/user")
  async getUserDeliveries(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return Responses.deliveries(await Delivering.getDeliveriesByUser(user));
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
  /**
   * Gets tags for a specific post.
   * Ensures the post is not expired before retrieving tags.
   *
   * @param session The session of the user.
   * @param post The ID of the post.
   * @returns The tags associated with the post.
   */
  @Router.get("/tags/:post")
  async getTags(session: SessionDoc, post: string) {
    const oid = new ObjectId(post);

    // Ensure the post is not expired
    await Posting.assertPostIsNotExpired(oid);

    // Get tags for the post
    return await Tagging.getItemTags(oid);
  }

  /**
   * Gets all items (posts) with a specific array of tags.
   * Ensures that all provided tags are present in the item's tags.
   *
   * @param tags The array of tags to match.
   * @returns A list of posts matching the specified tags.
   */
  @Router.get("/tags/items")
  @Router.validate(z.object({ tags: z.array(z.string()).min(1) }))
  async getItemsWithTags(tags: string[]) {
    const matchingItems = await Tagging.getItemsWithTags(tags);
    return matchingItems;
  }

  /**
   * Adds a tag to a specific post.
   * Ensures the user is a donor, the post author, and the post is not expired.
   *
   * @param session The session of the user.
   * @param post The ID of the post.
   * @param tag The tag to add.
   * @returns A message indicating the tag was added.
   */
  @Router.post("/tags/:post")
  async addTag(session: SessionDoc, post: string, tag: string) {
    const oid = new ObjectId(post);
    const user = Sessioning.getUser(session);

    // Ensure the user is a donor
    await Authing.assertIsRole(user, "Donor");

    // Ensure the user is the author of the post
    await Posting.assertAuthorIsUser(oid, user);

    // Ensure the post is not expired
    await Posting.assertPostIsNotExpired(oid);

    // Add the tag to the post
    await Tagging.addTag(tag, oid);
    console.log("ttttTTTaggggg", tag);
    return { msg: `Tag "${tag}" added to post ${post}` };
  }

  /**
   * Deletes a tag from a specific post.
   * Ensures the user is a donor, the post author, and the post is not expired.
   *
   * @param session The session of the user.
   * @param post The ID of the post.
   * @param tag The tag to delete.
   * @returns A message indicating the tag was deleted.
   */
  @Router.delete("/tags/:post/:tag")
  async deleteTag(session: SessionDoc, post: string, tag: string) {
    const oid = new ObjectId(post);
    const user = Sessioning.getUser(session);

    // Ensure the user is a donor
    await Authing.assertIsRole(user, "Donor");

    // Ensure the user is the author of the post
    await Posting.assertAuthorIsUser(oid, user);

    // Ensure the post is not expired
    await Posting.assertPostIsNotExpired(oid);

    // Delete the tag from the post
    await Tagging.delTag(tag, oid);

    return { msg: `Tag "${tag}" deleted from post ${post}` };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
