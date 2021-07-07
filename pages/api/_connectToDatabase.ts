const { MongoClient } = require('mongodb');

// Create cached connection variable

let cachedDb: any = null;

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
export async function connectToDatabase() {
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(process.env.MONGODB_FULL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Select the database through the connection,
  // using the database path of the connection string
  const db = await client.db(process.env.MONDODB_NAME);

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
}
