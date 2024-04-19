import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskById,
} from "../controller/TaskController";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTaskById);
router.delete("/:id", deleteTask);
export const TaskRoute = router;
