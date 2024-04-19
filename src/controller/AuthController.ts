import { sign } from "jsonwebtoken";
import { Request, Response } from "express";
import { UserModel } from "../entities/User";
import { hashPassword } from "../utils/hash";
import { validationResult } from "express-validator";

export const login = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByCredentionals(
      req.body.email!,
      req.body.password
    );
    const token = sign({ _id: user }, process.env.JWT_SECRET!, {
      expiresIn: "1 days",
    });
    res.send({ user, token });
  } catch (error) {
    console.log({ error });
    res.status(500).end();
  }
};

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await hashPassword(req.body.password);

    // Create new user
    const user = new UserModel({
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user to the database
    await user.save();

    // Create a token
    const token = sign({ _id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d", // Token expires in one day
    });

    // Send back the new user and token
    res.status(201).send({ user, token });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Error registering new user." });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Retrieve the user from the database
    //@ts-ignore
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove the token used for this session
    //@ts-ignore
    user.tokens = user.tokens.filter((token) => token.token !== req.token!);

    res.send({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Failed to log out." });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    // Retrieve the user from the database
    //@ts-ignore
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove the token used for this session
    //@ts-ignore
    user.tokens = [];

    res.send({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Failed to log out." });
  }
};
