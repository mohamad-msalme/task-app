import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const Authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // Ensure the authorization header exists and is formatted correctly
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not Authorized: No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Get the token from the header

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as jwt.JwtPayload;

    // Ensure the token contains the required data
    if (!decoded._id) {
      throw new Error("Invalid token data"); // Token must contain user ID
    }
    //@ts-ignore
    req.userId = decoded._id; // Assign the user ID to the request object
    //@ts-ignore
    req.token = token as string;
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error("JWT Error:"); // Log the error for debugging
    return res.status(401).json({ message: "Not Authorized: Invalid token." });
  }
};
