import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const sql = neon(process.env.DATABASE_URL);

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = params ? await sql(text, params) : await sql(text);
  return result as T[];
}

export { sql };
