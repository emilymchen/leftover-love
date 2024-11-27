import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface DeliveryDoc extends BaseDoc {
  status: "Not Started" | "In Progress" | "Completed";
  request: ObjectId;
  deliverer: ObjectId;
  address: string;
  time: Date;
  receiver: ObjectId;
}

/**
 * concept: Delivering [User, Request]
 */
export default class DeliveringConcept {
  public readonly deliveries: DocCollection<DeliveryDoc>;

  /**
   * Make an instance of Delivering.
   */
  constructor(collectionName: string) {
    this.deliveries = new DocCollection<DeliveryDoc>(collectionName);
  }

  async acceptDelivery(deliverer: ObjectId, request: ObjectId, address: string, time: Date, receiver: ObjectId) {
    const _id = await this.deliveries.createOne({ status: "Not Started", request, deliverer, address, time, receiver });
    return { msg: "Delivery successfully created!", delivery: await this.deliveries.readOne({ _id }) };
  }

  async updateDelivery(_id: ObjectId, address?: string, time?: Date, receiver?: ObjectId) {
    await this.deliveries.partialUpdateOne({ _id }, { address, time, receiver });
    return { msg: "Delivery successfully updated!" };
  }

  async unacceptDelivery(_id: ObjectId) {
    await this.deliveries.deleteOne({ _id });
    return { msg: "Delivery unaccepted successfully!" };
  }

  async deleteDeliveryByRequest(request: ObjectId) {
    await this.deliveries.deleteMany({ request });
    return { msg: "Deliveries associated with this request deleted successfully!" };
  }

  async getDeliveries() {
    return await this.deliveries.readMany({}, { sort: { _id: -1 } });
  }

  async getDeliveryAddress(_id: ObjectId) {
    return this.deliveries.readOne({ _id }).then((delivery) => delivery?.address);
  }

  async getDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer });
  }

  async getDeliveriesByRequest(request: ObjectId) {
    return await this.deliveries.readMany({ request });
  }

  async getIncompleteDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer, status: { $ne: "Completed" } });
  }

  async getCompletedDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer, status: "Completed" });
  }

  async getDeliveryDeliverer(_id: ObjectId) {
    return this.deliveries.readOne({ _id }).then((delivery) => delivery?.deliverer);
  }

  async startDelivery(_id: ObjectId) {
    await this.deliveries.partialUpdateOne({ _id }, { status: "In Progress" });
    return { msg: "Delivery started successfully!" };
  }

  async completeDelivery(_id: ObjectId) {
    await this.deliveries.partialUpdateOne({ _id }, { status: "Completed" });
    return { msg: "Delivery completed successfully!" };
  }

  async getDeliveryRequest(_id: ObjectId) {
    return this.deliveries.readOne({ _id }).then((delivery) => delivery?.request);
  }

  async assertDelivererIsUser(_id: ObjectId, user: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (!delivery) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    if (delivery?.deliverer.toString() !== user.toString()) {
      throw new DelivererNotMatchError(user, _id);
    }
  }

  async assertIsNotDelivered(item: ObjectId) {
    const delivery = await this.deliveries.readOne({ item });
    if (delivery?.status === "Completed") {
      throw new NotAllowedError(`Item ${item} is already delivered!`);
    }
  }

  async assertHasNotStartedDelivery(request: ObjectId) {
    const delivery = await this.deliveries.readOne({ request });
    if (delivery?.status == "Not Started") {
      throw new NotAllowedError(`Delivery for request ${request} has already started!`);
    }
  }

  async assertIsInProgressDelivery(request: ObjectId) {
    const delivery = await this.deliveries.readOne({ request });
    if (delivery?.status != "In Progress") {
      throw new NotAllowedError(`Delivery for request ${request} is not in progress!`);
    }
  }
}

export class DelivererNotMatchError extends NotAllowedError {
  constructor(
    public readonly deliverer: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the deliverer of delivery {1}!", deliverer, _id);
  }
}
