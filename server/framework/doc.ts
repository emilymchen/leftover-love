import {
  BulkWriteOptions,
  Collection,
  CountDocumentsOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindOneAndUpdateOptions,
  FindOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  ReplaceOptions,
  UpdateResult,
  WithoutId,
} from "mongodb";

import db from "../db";

export interface BaseDoc {
  _id: ObjectId;
  dateCreated: Date;
  dateUpdated: Date;
}

export type WithoutBase<T extends BaseDoc> = Omit<T, keyof BaseDoc>;

/**
 * MongoDB collection with operations that maintain created and updated timestamps.
 *
 * Note that you may wish to add more methods, e.g. using other MongoDB operations!
 */
export default class DocCollection<Schema extends BaseDoc> {
  public readonly collection: Collection<Schema>;
  private static collectionNames: Set<string> = new Set();

  constructor(public readonly name: string) {
    if (DocCollection.collectionNames.has(name)) {
      throw new Error(`Collection '${name}' already exists!`);
    }
    this.collection = db.collection(name);
  }

  /**
   * Remove internal fields from an item so that the client does not alter them.
   */
  private withoutInternal<P extends Partial<Schema>>(item: P): WithoutId<P> {
    const safe = Object.assign({}, item);
    delete safe._id;
    delete safe.dateCreated;
    delete safe.dateUpdated;
    return safe;
  }

  /**
   * Add `item` to the collection.
   * @returns the object ID of the inserted document
   */
  async createOne(item: Partial<Schema>): Promise<ObjectId> {
    const safe = this.withoutInternal(item);
    safe.dateCreated = new Date();
    safe.dateUpdated = new Date();
    return (await this.collection.insertOne(safe as OptionalUnlessRequiredId<Schema>)).insertedId;
  }

  /**
   * Add `items` to the collection.
   * @returns a record object of the form `{ <index>: <object ID> }` for inserted documents
   */
  async createMany(items: Partial<Schema>[], options?: BulkWriteOptions): Promise<Record<number, ObjectId>> {
    const safe = items.map((item) => {
      const safe = this.withoutInternal(item);
      safe.dateCreated = new Date();
      safe.dateUpdated = new Date();
      return safe;
    });
    return (await this.collection.insertMany(safe as OptionalUnlessRequiredId<Schema>[], options)).insertedIds;
  }

  /**
   * Read the document that matches `filter`
   * @returns the document, or `null` if no document matches
   */
  async readOne(filter: Filter<Schema>, options?: FindOptions): Promise<Schema | null> {
    return await this.collection.findOne<Schema>(filter, options);
  }

  /**
   * Read all documents that match `filter`
   * @returns all matching documents
   */
  async readMany(filter: Filter<Schema>, options?: FindOptions): Promise<Schema[]> {
    return await this.collection.find<Schema>(filter, options).toArray();
  }

  /**
   * Replace the document that matches `filter` with `item`.
   * @returns an object describing what was updated
   */
  async replaceOne(filter: Filter<Schema>, item: Partial<Schema>, options?: ReplaceOptions): Promise<UpdateResult<Schema> | Document> {
    const safe = this.withoutInternal(item);
    safe.dateUpdated = new Date();
    return await this.collection.replaceOne(filter, safe as WithoutId<Schema>, options);
  }

  /**
   * Update the document that matches `filter` with fields in `update`; only fields in `update` are updated.
   * @returns an object describing what was updated
   */
  async partialUpdateOne(filter: Filter<Schema>, update: Partial<Schema>, options?: FindOneAndUpdateOptions): Promise<UpdateResult<Schema>> {
    const safe = this.withoutInternal(update);
    safe.dateUpdated = new Date();
    return await this.collection.updateOne(filter, { $set: safe as Partial<Schema> }, options);
  }

  /**
   * Delete the document that matches `filter`.
   * @returns an object describing what was deleted
   */
  async deleteOne(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.collection.deleteOne(filter, options);
  }

  /**
   * Delete all documents that match `filter`.
   * @returns an object describing what was deleted
   */
  async deleteMany(filter: Filter<Schema>, options?: DeleteOptions): Promise<DeleteResult> {
    return await this.collection.deleteMany(filter, options);
  }

  /**
   * Count all documents that match `filter`.
   * @returns the count
   */
  async count(filter: Filter<Schema>, options?: CountDocumentsOptions): Promise<number> {
    return await this.collection.countDocuments(filter, options);
  }

  /**
   * Pop one document that matches `filter`, equivalent to calling `readOne` and `deleteOne`.
   * @returns the document, or `null` if no document matches
   */
  async popOne(filter: Filter<Schema>): Promise<Schema | null> {
    const one = await this.readOne(filter);
    if (one === null) {
      return null;
    }
    await this.deleteOne({ _id: one._id } as Filter<Schema>);
    return one;
  }

  /*
   * You may wish to add more methods, e.g. using other MongoDB operations!
   */
}
