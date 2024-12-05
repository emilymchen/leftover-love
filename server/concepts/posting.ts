import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  food_name: string;
  expiration_time: Date;
  quantity: number;
}

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
  }

  async create(author: ObjectId, food_name: string, expiration_time: Date, quantity: number) {
    if (new Date(expiration_time) < new Date()) {
      throw new InvalidExpirationTimeError();
    }
    const _id = await this.posts.createOne({ author, food_name, expiration_time, quantity });
    return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
  }

  async getPosts() {
    // Returns all posts! You might want to page for better client performance
    return await this.posts.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.posts.readMany({ author }, { sort: { expiration_time: -1 } });
  }

  async getById(_id: ObjectId) {
    return await this.posts.readOne({ _id });
  }

  async getExpirationTime(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    return post.expiration_time;
  }

  async getFoodName(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    return post.food_name;
  }

  async getAuthor(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    return post.author;
  }

  async getQuantity(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    return post.quantity;
  }

  async update(_id: ObjectId, food_name?: string, expiration_time?: Date, quantity?: number) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    if (expiration_time && new Date(expiration_time) < new Date()) {
      throw new InvalidExpirationTimeError();
    }
    await this.posts.partialUpdateOne({ _id }, { food_name, expiration_time, quantity });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }

  async isPostExpired(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    return new Date(post.expiration_time).toISOString() < new Date().toISOString();
  }

  async assertPostIsNotExpired(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post does not exist!`);
    }
    if (await this.isPostExpired(_id)) {
      throw new NotAllowedError(`Post is expired!`);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}

export class InvalidExpirationTimeError extends NotAllowedError {
  constructor() {
    super("Expiration time must be in the future!");
  }
}
