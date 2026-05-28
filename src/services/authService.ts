import { db } from "../db.js";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/token.js";

export async function register(
  username: string,
  email: string,
  password: string,
) {
  email = email.trim().toLowerCase();
  username = username.trim();

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRef = await db.collection("users").add({
    username,
    email,
    password: hashedPassword,
    role: "user",
  });

  const userSnap = await db.collection("users").doc(userRef.id).get();
  if (!userSnap.exists) throw new Error("User not found");
  const userData = userSnap.data();
  if (!userData) throw new Error("No user");
  const { password: value, ...userSafe } = userData;

  // refresh
  const refreshToken = signRefreshToken({ sub: userSnap.id });

  const accessToken = signAccessToken({
    sub: userSnap.id,
    role: userSafe.role,
  });

  return {
    userId: userSnap.id,
    refreshToken,
    accessToken,
  };
}
