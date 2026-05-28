import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessPayload } from "../utils/token.js";

export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader)
      return response
        .status(401)
        .json({ success: false, message: "Unauthorized" });

    if (!authHeader.startsWith("Bearer "))
      return response
        .status(401)
        .json({ success: false, message: "Invalid token format" });

    // get token
    const token = authHeader.split(" ")[1];
    if (!token)
      return response.status(401).json({ success: false, message: "No token" });

    // verify token
    const payload: AccessPayload = verifyAccessToken(token);
    if (!payload)
      return response
        .status(401)
        .json({ success: false, message: "Invalid token" });

    request.user = payload;
    next();
  } catch (error) {}
}
