import jwt from "jsonwebtoken";
import expres from "express";
import { UserModel } from "../entities/User";
import { Authenticated } from "../middleware/auth";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controller/UserController";

const router = expres.Router();

router.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findByCredentionals(
      req.body.email!,
      req.body.password
    );
    const token = jwt.sign({ _id: user }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
    console.log(user);
    res.send({ user, token });
  } catch (error) {
    console.log({ error });
    res.status(500).end();
  }
});

router.get("/all", Authenticated, getAllUsers);

router.get("/:userId", Authenticated, getUserById);

router.post("/", Authenticated, createUser);

router.patch("/:userId", Authenticated, updateUserById);

router.delete("/:userId", Authenticated, deleteUserById);

export const UserRoute = router;
