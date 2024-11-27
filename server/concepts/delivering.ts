import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface DeliveryDoc extends BaseDoc {
  status: "Not Started" | "In Progress" | "Completed";
  request: ObjectId;
  deliverer: ObjectId;
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

  async acceptDelivery(deliverer: ObjectId, request: ObjectId) {
    const _id = await this.deliveries.createOne({ status: "Not Started", request, deliverer });
    return { msg: "Delivery successfully created!", delivery: await this.deliveries.readOne({ _id }) };
  }

  async unacceptDelivery(_id: ObjectId) {
    if (!(await this.deliveries.readOne({ _id }))) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    await this.deliveries.deleteOne({ _id });
    return { msg: "Delivery unaccepted successfully!" };
  }

  async deleteDeliveryByRequest(request: ObjectId) {
    await this.deliveries.deleteMany({ request });
    return { msg: "Deliveries associated with this request deleted successfully!" };
  }

  async getClaim(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (!delivery) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    return delivery.request;
  }

  async getDeliveries() {
    return await this.deliveries.readMany({}, { sort: { _id: -1 } });
  }

  async getDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer });
  }

  async getDeliveryByRequest(request: ObjectId) {
    return await this.deliveries.readOne({ request });
  }

  async getIncompleteDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer, status: { $ne: "Completed" } });
  }

  async getCompletedDeliveriesByUser(deliverer: ObjectId) {
    return await this.deliveries.readMany({ deliverer, status: "Completed" });
  }

  async getDeliveryDeliverer(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (!delivery) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    return this.deliveries.readOne({ _id }).then((delivery) => delivery?.deliverer);
  }

  async startDelivery(_id: ObjectId) {
    if (!(await this.deliveries.readOne({ _id }))) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    await this.deliveries.partialUpdateOne({ _id }, { status: "In Progress" });
    return { msg: "Delivery started successfully!" };
  }

  async completeDelivery(_id: ObjectId) {
    if (!(await this.deliveries.readOne({ _id }))) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    await this.deliveries.partialUpdateOne({ _id }, { status: "Completed" });
    return { msg: "Delivery completed successfully!" };
  }

  /**
   * Given a request, returns whether a delivery has been processed for it.
   */
  async doesRequestForDeliveryExist(request: ObjectId) {
    const deliveries = await this.deliveries.readMany({ request });
    return deliveries.length > 0;
  }

  async getDeliveryRequest(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (!delivery) {
      throw new NotFoundError(`Delivery ${_id} does not exist!`);
    }
    return delivery.request;
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

  async assertIsNotDelivered(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (delivery?.status === "Completed") {
      throw new NotAllowedError(`Delivery has already been delivered!`);
    }
  }

  async assertIsNotStartedDelivery(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (delivery?.status != "Not Started") {
      throw new NotAllowedError(`Delivery ${_id} has already started!`);
    }
  }

  async assertIsInProgressDelivery(_id: ObjectId) {
    const delivery = await this.deliveries.readOne({ _id });
    if (delivery?.status != "In Progress") {
      throw new NotAllowedError(`Delivery ${_id} is not in progress!`);
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
