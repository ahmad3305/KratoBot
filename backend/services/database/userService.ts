// User DB service: MySQL connection required
import { pool } from "../../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

type User = {
  user_id: number,
  full_name: string,
  email: string,
  password_hash: string,
  created_at: string,
  updated_at: string,
};

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Users WHERE email = ? LIMIT 1",
    [email]
  );
  return (rows[0] as User) || null;
}

// Create new user
export async function createUser(full_name: string, email: string, password_hash: string): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO Users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [full_name, email, password_hash]
  );
  return result.insertId;
}