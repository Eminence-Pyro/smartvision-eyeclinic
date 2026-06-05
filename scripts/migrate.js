#!/usr/bin/env node
/**
 * Run this once to set up the database schema.
 * Usage: node scripts/migrate.js
 * Requires DATABASE_URL in environment.
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const schemaPath = path.join(__dirname, "../src/lib/db/schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error("❌ Schema file not found:", schemaPath);
    process.exit(1);
  }

  const schema = fs.readFileSync(schemaPath, "utf8");

  console.log("🚀 Running database migration…");
  try {
    // Split and run each statement
    const statements = schema
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      await sql(stmt);
    }
    console.log("✅ Migration complete! Database is ready.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
