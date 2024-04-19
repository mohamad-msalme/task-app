import mongoose, { Schema } from "mongoose";

interface Task {
  description: string;
  completed: boolean; // Use lowercase boolean
  owner: Schema.Types.ObjectId;
}

const taskSchema = new mongoose.Schema<Task>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    strict: "throw",
  }
);

export const TaskModel = mongoose.model("Task", taskSchema);
