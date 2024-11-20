import { MongoClient, ServerApiVersion } from "mongodb";

const mongoUri = process.env.MONGO_SRV;
if (!mongoUri) {
  throw new Error("Please add the MongoDB connection SRV as 'MONGO_SRV'");
}

export const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export let DB_NAME: string;
if (process.env.TEST) {
  DB_NAME = "test-db"; // Used only for unit-tests
} else {
  DB_NAME = "61040-db"; // Feel free to change db name!
}

/**
 * Attempts to complete the connection to {@link client}.
 */
export async function connectDb() {
  try {
    await client.connect();
  } catch (e) {
    throw new Error("MongoDB Connection failed: " + e);
  }
  await client.db("admin").command({ ping: 1 });
  console.log("You successfully connected to MongoDB!");
}

const db = client.db(DB_NAME);
export default db;
