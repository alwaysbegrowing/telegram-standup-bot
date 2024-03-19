import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
declare let global: { prisma: PrismaClient };

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Maintain a cached connection across hot reloads in development.
let cachedConnection = globalThis.mongo;

if (!cachedConnection) {
  cachedConnection = globalThis.mongo = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<{
  db: ReturnType<MongoClient['db']>;
}> {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }

  if (!cachedConnection.promise) {
    const options = {
      // Other MongoClient options can be added here, if needed
    };

    cachedConnection.promise = MongoClient.connect(
      process.env.MONGODB_FULL_URI,
      options,
    ).then((client) => ({
      client,
      db: client.db(process.env.MONGODB_NAME),
    }));
  }

  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}

export default prisma;
