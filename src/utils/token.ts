import "dotenv/config";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import ms from "ms";

const REFRESH = process.env.JWT_REFRESH_TOKEN as string;
const ACCESS = process.env.JWT_ACCESS_TOKEN as string;
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES as string;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES as string;

if (!REFRESH || !ACCESS || !REFRESH_EXPIRES || !ACCESS_EXPIRES)
  throw new Error("Token credentials missing");

// payloads
export type RefreshPayload = JwtPayload & {
  sub: string;
};

export type AccessPayload = JwtPayload & {
  sub: string;
  role: string;
};

// options
const refreshOptions: SignOptions = {
  expiresIn: REFRESH_EXPIRES as ms.StringValue,
  algorithm: "HS256",
};

const accessOptions: SignOptions = {
  expiresIn: ACCESS_EXPIRES as ms.StringValue,
  algorithm: "HS256",
};

// sign
export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, REFRESH, refreshOptions);
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, ACCESS, accessOptions);
}

// verify
export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, REFRESH) as RefreshPayload;
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, ACCESS) as AccessPayload;
}
