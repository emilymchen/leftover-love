import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ClaimDoc extends BaseDoc {
  item: ObjectId;
  status: "Requested" | "Completed";
  claimUser: ObjectId;
  method: "Pickup" | "Delivery";
  destinationAddress: string;
  instructions?: string;
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

  /**
   * Create a claim for an item using the pickup method.
   */
  async createPickupClaim(claimUser: ObjectId, item: ObjectId) {
    const _id = await this.claims.createOne({ item, status: "Requested", claimUser, method: "Pickup" });
    return { msg: "Claim successfully created!", claim: await this.claims.readOne({ _id }) };
  }

  /**
   * Create a claim for an item using the delivery method.
   */
  async createDeliveryClaim(claimUser: ObjectId, item: ObjectId, address: string, instructions?: string) {
    const _id = await this.claims.createOne({ item, status: "Requested", claimUser, method: "Delivery", destinationAddress: address, instructions });
    return { msg: "Claim successfully created!", claim: await this.claims.readOne({ _id }) };
  }

  async deleteClaim(item: ObjectId) {
    await this.claims.deleteOne({ item });
    return { msg: "Claim deleted successfully!", claim: item };
  }

  /**
   * Changes the status of a claim to "Completed".
   */
  async completeClaim(_id: ObjectId) {
    if (!(await this.claims.readOne({ _id }))) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    await this.claims.partialUpdateOne({ _id }, { status: "Completed" });
    return { msg: "Claim completed successfully!" };
  }

  /**
   * Returns all claims.
   */
  async getClaims() {
    return await this.claims.readMany({}, { sort: { _id: -1 } });
  }

  /**
   * Given a claim, returns the user who claimed it.
   */
  async getClaimUser(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    return claim.claimUser;
  }

  /**
   * Given a claim, returns the item associated with it.
   */
  async getClaimItem(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    return claim.item;
  }

  /**
   * Given a user, returns all claims made by them.
   */
  async getClaimsByUser(claimUser: ObjectId) {
    return await this.claims.readMany({ claimUser });
  }

  /**
   * Given an item, returns the claim associated with it.
   */
  async getClaimsByItem(item: ObjectId) {
    return await this.claims.readOne({ item });
  }

  async getClaimDestinationAddress(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    return claim.destinationAddress;
  }

  async getClaimInstructions(_id: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    return claim.instructions;
  }

  async getIncompleteDeliveryClaims() {
    return await this.claims.readMany({ status: "Requested", method: "Delivery" });
  }

  async getClaimById(_id: ObjectId) {
    return await this.claims.readOne({ _id });
  }

  async assertClaimerIsUser(_id: ObjectId, user: ObjectId) {
    const claim = await this.claims.readOne({ _id });
    if (!claim) {
      throw new NotFoundError(`Claim ${_id} does not exist!`);
    }
    if (claim?.claimUser.toString() !== user.toString()) {
      throw new ClaimUserNotMatchError(claim.claimUser, _id);
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
    return await this.claims.readOne({ item });
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

export class ClaimUserNotMatchError extends NotAllowedError {
  constructor(
    public readonly claimUser: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the claimer of claim {1}!", claimUser, _id);
  }
}
