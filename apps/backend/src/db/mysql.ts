import mysql, { Pool } from "mysql2/promise";
import { databaseConfig } from "../config/database";

export const pool: Pool = mysql.createPool(databaseConfig);

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch {
    return false;
  }
}
