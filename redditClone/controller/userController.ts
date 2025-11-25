// @ts-nocheck
import * as db from "../db";

// Find user by uname + password
export async function getUserByEmailIdAndPassword(uname, password) {
  const user = await db.getUserByUname(uname);
  if (!user) return null;
  if (user.password !== password) return null; // plaintext (basic demo)
  return user;
}

// Find user by ID (for deserializeUser)
export function getUserById(id) {
  return db.getUser(id);
}
