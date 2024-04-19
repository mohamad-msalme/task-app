import { TaskModel } from "../entities/Task";
import { MongooseError } from "mongoose";
import { NextFunction, Request, Response } from "express";

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let page = Math.max(Number(req.query.page) || 1, 1);
  let pageSize = Math.max(Number(req.query.pageSize) || 10, 1);

  const skip = (page - 1) * pageSize;

  try {
    const [users, total] = await Promise.all([
      TaskModel.find().skip(skip).limit(pageSize),
      TaskModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Construct URLs for next and previous pages
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const queryParams = new URLSearchParams({
      ...req.query,
      pageSize: pageSize.toString(),
    });

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    const prevUrl = prevPage
      ? `${baseUrl}?${queryParams.toString()}&page=${prevPage}`
      : null;
    const nextUrl = nextPage
      ? `${baseUrl}?${queryParams.toString()}&page=${nextPage}`
      : null;

    res.send({
      success: true,
      data: users,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize,
        prevPageUrl: prevUrl,
        nextPageUrl: nextUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const owner = req.userId!;
    const newTask = new TaskModel({ ...req.body, owner });
    await newTask.save();
    res.status(201).send({
      success: true,
      data: newTask,
    });
  } catch (error) {
    if (error instanceof MongooseError) {
      res.status(400).send({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    next(error);
  }
};

export const updateTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Missing params",
      },
    });
  }
  try {
    const id = req.params.id;
    const task = await TaskModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // This option returns the document after update was applied.
    );
    if (!task) {
      return res.status(404).send({
        success: false,
        error: {
          message: "Task not found",
        },
      });
    }
    return res.send({
      success: true,
      data: task, // Consider if you want to return the updated document or not.
    });
  } catch (error) {
    if (error instanceof MongooseError) {
      res.status(400).send({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Missing Task id",
      },
    });
  }
  try {
    const id = req.params.id;
    const task = await TaskModel.deleteOne({ _id: id });
    if (task.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        error: {
          message: "Task not found",
        },
      });
    }
    return res.send({
      success: true,
      data: task, // Consider if you want to return the updated document or not.
    });
  } catch (error) {
    if (error instanceof MongooseError) {
      res.status(400).send({
        success: false,
        error: {
          message: error.message,
        },
      });
    }
    next(error);
  }
};
