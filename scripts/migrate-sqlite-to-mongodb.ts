/**
 * One-time migration: copy data from local SQLite (dev.db) into MongoDB.
 *
 * Run: npm run db:migrate-from-sqlite
 */
import "dotenv/config";
import Database from "better-sqlite3";
import { MongoClient } from "mongodb";

const SQLITE_PATH = "dev.db";

const COLLECTIONS = [
  "User",
  "SiteSettings",
  "PageSection",
  "HeroBanner",
  "Testimonial",
  "ProductType",
  "ParameterDefinition",
  "Product",
  "ParameterValue",
  "FormTemplate",
  "FormFieldDefinition",
  "DealerOrder",
] as const;

const DATE_FIELDS = new Set(["createdAt", "updatedAt"]);
const BOOLEAN_FIELDS = new Set([
  "active",
  "enabled",
  "required",
  "published",
  "featured",
]);

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return Boolean(value);
}

function toMongoDocument(row: Record<string, unknown>) {
  const { id, ...rest } = row;
  const document: Record<string, unknown> = { _id: id };

  for (const [key, value] of Object.entries(rest)) {
    if (value == null) {
      document[key] = value;
      continue;
    }

    if (DATE_FIELDS.has(key) && typeof value === "string") {
      document[key] = new Date(value);
      continue;
    }

    if (BOOLEAN_FIELDS.has(key)) {
      document[key] = toBoolean(value);
      continue;
    }

    document[key] = value;
  }

  return document;
}

function readSqliteTable(db: Database.Database, table: string) {
  return db.prepare(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[];
}

function getDbName(url: string) {
  const match = url.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
  return match?.[1] || "tiger_rydo";
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const mongo = new MongoClient(databaseUrl);

  await mongo.connect();
  const db = mongo.db(getDbName(databaseUrl));

  try {
    for (const collection of COLLECTIONS) {
      const rows = readSqliteTable(sqlite, collection);
      if (rows.length === 0) {
        console.log(`skip ${collection} (empty)`);
        continue;
      }

      await db.collection(collection).deleteMany({});
      await db.collection(collection).insertMany(rows.map(toMongoDocument));
      console.log(`migrated ${collection}: ${rows.length} rows`);
    }

    console.log(`\nDone. Database: ${getDbName(databaseUrl)}`);
  } finally {
    sqlite.close();
    await mongo.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
