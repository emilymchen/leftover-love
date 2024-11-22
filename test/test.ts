import { strict as assert } from "assert";
import dotenv from "dotenv";
import process from "process";

// Make sure we are in test mode!
process.env.TEST = "true";

// Also need to load the .env file
dotenv.config();

import type { SessionDoc } from "../server/concepts/sessioning";

// Test mode must be set before importing the routes
import { app } from "../server/routes";

import db, { client } from "../server/db";
if (db.databaseName !== "test-db") {
  throw new Error("Not connected to test database");
}

// Actual sessions are created by Express, here we use a mock session
function getEmptySession() {
  return { cookie: {} } as SessionDoc;
}

// Before each test...
beforeEach(async () => {
  // Drop the test database
  await db.dropDatabase();

  // Add some default users we can use
  await app.registerDonor(getEmptySession(), "alice", "alice123", "Donor", "212 Goldenwest");
  await app.registerDonor(getEmptySession(), "bob", "bob123", "Admin", "189 Vassar Street");
});

// After all tests are done...
after(async () => {
  // Close the database connection so that Node exits
  await client.close();
});

describe("Create a user and log in", () => {
  it("should create a user and log in", async () => {
    const session = getEmptySession();

    const created = await app.registerDonor(session, "barish", "1234", "Donor", "212 Goldenwest");
    assert(created.user);
    await assert.rejects(app.logIn(session, "barish", "123"));
    await app.logIn(session, "barish", "1234");
    await assert.rejects(app.logIn(session, "barish", "1234"), "Should not be able to login while already logged-in");
  });

  it("duplicate username should fail", async () => {
    const session = getEmptySession();

    const created = await app.registerDonor(session, "barish", "1234", "Donor", "212 Goldenwest");
    assert(created.user);
    await assert.rejects(app.registerDonor(session, "barish", "1234", "Donor", "212 Goldenwest"));
  });

  it("get invalid username should fail", async () => {
    await assert.rejects(app.getUser(""), "Username should be at least 1 character long");
    await app.getUser("alice");
  });
});

/*
 * As you add more tests, remember to put them inside `describe` blocks.
 */
