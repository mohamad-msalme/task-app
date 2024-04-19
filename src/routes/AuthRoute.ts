import express from "express";
import { body } from "express-validator";
import { Authenticated } from "../middleware/auth";
import {
  login,
  logout,
  logoutAll,
  register,
} from "../controller/AuthController";

const router = express.Router();

router.post("/login", login);

const validateRegister = [
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

router.post("/register", validateRegister, register);

router.post("/logout", Authenticated, logout);

router.post("/logout/all", Authenticated, logoutAll);

export const AuthRouter = router;
