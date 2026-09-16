import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cache;

let creditsMigrated = false;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cache.conn) {
    if (!cache.promise) {
      cache.promise = mongoose
        .connect(MONGODB_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 8000,
        })
        .catch((error) => {
          cache.promise = null;
          cache.conn = null;
          throw error;
        });
    }
    cache.conn = await cache.promise;
  }

  if (!creditsMigrated) {
    creditsMigrated = true;
    const { migrateSplitCredits } = await import("@/lib/credits");
    await migrateSplitCredits();
  }

  return cache.conn;
}
