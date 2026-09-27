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
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10,
          family: 4,
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
    void import("@/lib/credits")
      .then((mod) => mod.migrateSplitCredits())
      .catch((error) => {
        creditsMigrated = false;
        console.error("credit split migrate failed", error);
      });
  }

  return cache.conn;
}
