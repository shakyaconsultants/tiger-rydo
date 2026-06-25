export function getDatabaseUrl() {
  return process.env.DATABASE_URL || "file:./dev.db";
}

export function isTursoDatabase(url = getDatabaseUrl()) {
  return url.startsWith("libsql:") || (url.startsWith("https://") && url.includes(".turso."));
}
