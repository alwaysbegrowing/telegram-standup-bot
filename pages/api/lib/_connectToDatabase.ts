import { MongoClient } from 'mongodb';

// Maintain a cached connection across hot reloads in development.
let cachedConnection = globalThis.mongo;

if (!cachedConnection) {
  cachedConnection = globalThis.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const options = {
      // Other MongoClient options can be added here, if needed
    };

    cachedConnection.promise = MongoClient.connect(
      process.env.MONGODB_FULL_URI,
      options
    ).then((client) => ({
      client,
      db: client.db(process.env.MONGODB_NAME),
    }));
  }

  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}
