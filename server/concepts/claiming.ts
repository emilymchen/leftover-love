import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ClaimDoc extends BaseDoc {
  item: ObjectId;
  status: "Requested" | "Completed";
  claimUser: ObjectId;
  method: "Pickup" | "Delivery";
  claimAddress: string;
}

/**
 * concept: Claiming [User, Item]
 */
export default class ClaimingConcept {
  public readonly claims: DocCollection<ClaimDoc>;

  /**
   * Make an instance of Claiming.
   */
  constructor(collectionName: string) {
    this.claims = new DocCollection<ClaimDoc>(collectionName);
  }

  async createPickupClaim(claimUser: ObjectId, item: ObjectId) {
    const _id = await this.claims.createOne({ item, status: "Requested", claimUser, method: "Pickup" });
    return { msg: "Claim successfully created!", claim: await this.claims.readOne({ _id }) };
  }

  async createDeliveryClaim(claimUser: ObjectId, item: ObjectId, claimAddress: string) {
    const _id = await this.claims.createOne({ item, status: "Requested", claimUser, method: "Delivery", claimAddress });
    return { msg: "Claim successfully created!", claim: await this.claims.readOne({ _id }) };
  }

  async deleteClaim(item: ObjectId) {
    await this.claims.deleteOne({ item });
    return { msg: "Claim deleted successfully!" };
  }

  async completeClaim(_id: ObjectId) {
    await this.claims.partialUpdateOne({ _id }, { status: "Completed" });
    return { msg: "Claim completed successfully!" };
  }

  async getClaims() {
    return await this.claims.readMany({}, { sort: { _id: -1 } });
  }

  async getClaimsByUser(claimUser: ObjectId) {
    return await this.claims.readMany({ claimUser });
  }

  async getItemClaim(item: ObjectId) {
    return await this.claims.readOne({ item });
  }

  async assertClaimerIsUser(_id: ObjectId, user: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    if (claim?.claimUser.toString() !== user.toString()) {
      throw new NotAllowedError(`Claim ${_id} does not belong to user ${user}!`);
    }
  }

  async assertIsNotClaimed(item: ObjectId) {
    const claim = await this.claims.readOne({ item });
    if (claim) {
      throw new NotAllowedError(`Item ${item} is already claimed!`);
    }
  }

  async assertIsClaimed(item: ObjectId) {
    const claim = await this.claims.readOne({ item });
    if (!claim) {
      throw new NotAllowedError(`Item ${item} is not claimed!`);
    }
  }

  async assertClaimIsNotCompleted(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    if (claim.status === "Completed") {
      throw new NotAllowedError(`Claim ${_id} is already completed!`);
    }
  }

  async isItemClaimed(item: ObjectId) {
    return !!(await this.claims.readOne({ item }));
  }

  async assertIsPickupClaim(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    if (claim.method !== "Pickup") {
      throw new NotAllowedError(`Claim ${_id} is not a pickup claim!`);
    }
  }

  async assertIsDeliveryClaim(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    if (claim.method !== "Delivery") {
      throw new NotAllowedError(`Claim ${_id} is not a delivery claim!`);
    }
  }
}
