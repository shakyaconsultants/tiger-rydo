/**
 * One-time production database setup for Turso.
 *
 * 1. Go to https://turso.tech → Account → API tokens → Create token
 * 2. Run:
 *    set TURSO_API_TOKEN=your-token
 *    node scripts/setup-production.mjs
 * 3. Copy printed env vars into Vercel → Settings → Environment Variables
 * 4. git push (Vercel redeploys automatically)
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const API = "https://api.turso.tech/v1";
const token = process.env.TURSO_API_TOKEN;
const DB_NAME = process.env.TURSO_DB_NAME || "tiger-rydo";

if (!token) {
  console.error("\n❌ TURSO_API_TOKEN missing.\n");
  console.error("Steps:");
  console.error("  1. Open https://turso.tech and sign in (free)");
  console.error("  2. Profile → API tokens → Create token");
  console.error("  3. PowerShell:");
  console.error('     $env:TURSO_API_TOKEN="paste-token-here"');
  console.error("     node scripts/setup-production.mjs\n");
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || data.message || text || res.statusText);
  return data;
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

const orgs = await api("/organizations");
const org = orgs.organizations?.[0]?.name;
if (!org) throw new Error("No Turso organization found. Complete signup at turso.tech first.");

let db;
try {
  const existing = await api(`/organizations/${org}/databases/${DB_NAME}`);
  db = existing.database;
  console.log(`\n✓ Database "${DB_NAME}" already exists`);
} catch {
  try {
    const created = await api(`/organizations/${org}/databases`, {
      method: "POST",
      body: JSON.stringify({ name: DB_NAME, group: "default" }),
    });
    db = created.database;
    console.log(`\n✓ Created database "${DB_NAME}"`);
  } catch (err) {
    if (String(err.message).includes("group not found")) {
      await api(`/organizations/${org}/groups`, {
        method: "POST",
        body: JSON.stringify({ name: "default", location: "bom" }),
      });
      const created = await api(`/organizations/${org}/databases`, {
        method: "POST",
        body: JSON.stringify({ name: DB_NAME, group: "default" }),
      });
      db = created.database;
      console.log(`\n✓ Created group + database "${DB_NAME}"`);
    } else {
      throw err;
    }
  }
}

const databaseUrl = `libsql://${db.Hostname}`;

const { jwt: dbToken } = await api(`/organizations/${org}/databases/${DB_NAME}/auth/tokens`, {
  method: "POST",
  body: JSON.stringify({}),
});

const authSecret = process.env.AUTH_SECRET || `tiger-rydo-${crypto.randomUUID()}`;

process.env.DATABASE_URL = databaseUrl;
process.env.TURSO_AUTH_TOKEN = dbToken;

run("npx prisma db push");
run("npx prisma db seed");

const vercelEnv = `# Add these in Vercel → Project → Settings → Environment Variables (Production + Preview)

DATABASE_URL=${databaseUrl}
TURSO_AUTH_TOKEN=${dbToken}
AUTH_SECRET=${authSecret}
AUTH_URL=https://YOUR-APP-NAME.vercel.app
`;

writeFileSync("scripts/vercel-env.txt", vercelEnv);

console.log("\n" + "=".repeat(60));
console.log("✅ Turso database ready! Saved: scripts/vercel-env.txt");
console.log("=".repeat(60));
console.log(vercelEnv);
console.log("Next: paste env vars in Vercel, replace AUTH_URL with your real domain, then git push.\n");
