import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
export default sql;

// Helper: run raw query with values
export async function query<T = Record<string, unknown>>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  if (values && values.length > 0) {
    const result = await sql(text, values);
    return result as T[];
  }
  const result = await sql(text);
  return result as T[];
}
