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

  const userExistRef = await db
    .collection("users")
    .where("email", "==", email)
    .get();

  if (!userExistRef.empty) throw new Error("Email already exist");

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

export async function login(email: string, password: string) {
  // check email exist
  const userSnap = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (userSnap.empty) throw new Error("Email does not exist");
  const userData = userSnap.docs[0]!.data();
  // check user password
  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) throw new Error("Email or password is incorrect");

  // refresh
  const refreshToken = signRefreshToken({ sub: userSnap.docs[0]!.id });
  const accessToken = signAccessToken({
    sub: userData.id,
    role: userData.role,
  });

  return {
    userId: userSnap.docs[0]!.id,
    refreshToken,
    accessToken,
  };
}
