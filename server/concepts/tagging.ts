import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface TagDoc extends BaseDoc {
  item: ObjectId;
  tags: Array<string>;
}

export default class TaggingConcept {
  public readonly tags: DocCollection<TagDoc>;

  /**
   * Make an instance of Tagging.
   */
  constructor(collectionName: string) {
    this.tags = new DocCollection<TagDoc>(collectionName);
  }

  /**
   * Add a tag to an item.
   * If the item does not exist, it will create a new document with the given tag.
   * If the tag already exists for the item, it throws an error.
   *
   * @param tag - The tag to add.
   * @param item - The ID of the item to which the tag will be added.
   * @throws Error if the tag already exists for the item.
   */
  async addTag(tag: string, item: ObjectId): Promise<void> {
    const itemDoc = await this.tags.readOne({ item: item });
    if (itemDoc === null) {
      let t = new Array<string>();
      t.push(tag.toLowerCase());
      await this.tags.createOne({ item: item, tags: t });
      const _id = await this.tags.readOne({ item: item });
      return;
    }
    let existingTags = itemDoc.tags;
    if (!existingTags.includes(tag.toLowerCase())) {
      existingTags.push(tag.toLowerCase());
      const _id = await this.tags.partialUpdateOne({ item }, { tags: existingTags });
    } else {
      throw new Error(`Tag "${tag.toLowerCase()}" already exists for item ${item}`);
    }
  }

  /**
   * Remove a tag from an item.
   * If the item does not exist, it throws an error.
   * If the tag does not exist, it throws an error.
   *
   * @param tag - The tag to remove.
   * @param item - The ID of the item from which the tag will be removed.
   * @throws Error if the item does not exist or the tag is not associated with the item.
   */
  async delTag(tag: string, item: ObjectId) {
    const itemDoc = await this.tags.readOne({ item });
    if (!itemDoc) {
      throw new Error(`Item with ID ${item} does not exist.`);
    }

    let existingTags = itemDoc.tags;
    if (existingTags.includes(tag.toLowerCase())) {
      const index = existingTags.indexOf(tag.toLowerCase(), 0);
      if (index > -1) {
        existingTags.splice(index, 1);
      }
      await this.tags.partialUpdateOne({ item }, { tags: existingTags });
    } else {
      throw new Error(`Tag "${tag.toLowerCase()}" does not exist for item ${item}`);
    }
  }

  /**
   * Remove all tags from an item.
   * @param item  The ID of the item from which all tags will be removed.
   */
  async deleteTagsByItem(item: ObjectId) {
    return await this.tags.deleteMany({ item });
  }

  /**
   * Delete an item and all its associated tags.
   * If the item does not exist, it throws an error.
   *
   * @param item - The ID of the item to delete.
   * @throws Error if the item does not exist.
   */
  async deleteItem(item: ObjectId) {
    const deleteResult = await this.tags.deleteOne({ item });
    if (deleteResult.deletedCount === 0) {
      throw new Error(`Item with ID ${item} does not exist.`);
    }
  }

  /**
   * Get all tags associated with an item.
   * If the item does not exist, it returns `null`.
   *
   * @param item - The ID of the item to retrieve tags for.
   * @returns The document containing the tags for the item or `null` if the item does not exist.
   */
  async getItemTags(item: ObjectId) {
    const tags = await this.tags.readOne({ item });
    return tags;
  }

  /**
   * Get all items that have all specified tags.
   * Searches for items where the `tags` field contains every tag in the provided set.
   *
   * @param tags - The set of tags to search for.
   * @returns A list of items (documents) that match all the specified tags.
   * @throws Error if the provided set of tags is empty.
   */
  async getItemsWithTags(tags: Array<string>): Promise<TagDoc[]> {
    if (tags.length === 0) {
      throw new Error("No tags provided to search for.");
    }

    const matchingItems = await this.tags.readMany({ tags: { $all: tags } });

    return matchingItems;
  }
}
