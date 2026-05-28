import "dotenv/config";
import { db } from "../db.js";
import { login, register } from "../services/authService.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";

export async function RegisterController(request: Request, response: Response) {
  try {
    const { username, email, password } = request.body;

    if (!username || !email || !password)
      return response
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const user = await register(username, email, password);

    const hashedToken = await bcrypt.hash(user.refreshToken, 10);
    // store refresh
    await db.collection("refreshtokens").add({
      accountId: user.userId,
      hashedToken,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      createdAt: new Date(),
      userAgent: request.headers["user-agent"],
      ipAddress: request.ip,
    });

    response.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    return response.status(201).json({
      success: true,
      message: "User registered",
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.error(`Register controller failed ${error}`);
    return response.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function LoginController(request: Request, response: Response) {
  try {
    // inputs
    const { email, password } = request.body;
    const user = await login(email, password);

    // store refresh token
    const hashedToken = await bcrypt.hash(user.refreshToken, 10);
    await db.collection("refreshtokens").add({
      accountId: user.userId,
      hashedToken,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      createdAt: new Date(),
      userAgent: request.headers["user-agent"],
      ipAddress: request.ip,
    });

    response.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    return response.status(200).json({
      success: true,
      message: "User logged in",
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.error(`Login controller failed ${error}`);
    return response.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : error,
    });
  }
}
