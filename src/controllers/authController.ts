import { db } from "../db";
import { register } from "../services/authService";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";

export async function RegisterController(request: Request, response: Response) {
  try {
    const { username, email, password } = request.body;

    if (!username || !email || !password)
      return response
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const tokens = await register(username, email, password);

    const hashedToken = await bcrypt.hash(tokens.refreshToken, 10);
    // store refresh
    await db.collection("refreshtokens").add({
      accountId: tokens.userId,
      hashedToken,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      createdAt: new Date(),
      userAgent: request.headers["user-agent"],
      ipAddress: request.ip,
    });

    response.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    return response.status(201).json({
      success: true,
      message: "User registered",
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error(`Register controller failed ${error}`);
    return response.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : error,
    });
  }
}
