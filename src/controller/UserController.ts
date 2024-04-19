import { MongooseError } from "mongoose";
import { User, UserModel } from "../entities/User";
import { NextFunction, Response, Request } from "express";

const isEmaiDuplicated = async (email: string) => {
  const isExist = await UserModel.find({
    email,
  });

  return isExist.length !== 1;
};
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const checkEmailDuplicated = await isEmaiDuplicated(req.body.email);
    if (checkEmailDuplicated) {
      return res.status(400).send({
        success: false,
        error: {
          message: "Email is Duplicated",
        },
      });
    }

    const newUser = new UserModel(req.body);
    await newUser.save();

    res.status(201).send({
      success: true,
      data: newUser,
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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let page = Math.max(Number(req.query.page) || 1, 1);
  let pageSize = Math.max(Number(req.query.pageSize) || 10, 1);

  const skip = (page - 1) * pageSize;

  try {
    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(pageSize),
      UserModel.countDocuments(),
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

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(404).send({
        success: false,
        error: {
          message: "userId as parameters does not send it",
        },
      });
    }
    const user = await UserModel.findById(userId);
    return res.send({
      success: false,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allwoedKeys: (keyof User)[] = ["age", "email", "name", "password"];
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({
      success: false,
      error: {
        message: "UserId is missing",
      },
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (user === null) {
      return res.status(404).send({
        success: false,
        error: {
          message: "User not found",
        },
      });
    }

    if (user.email !== req.body.email) {
      const checkEmailDuplicated = await isEmaiDuplicated(req.body.email);
      if (checkEmailDuplicated) {
        return res.status(400).send({
          success: false,
          data: {
            message: "The Email is already use",
          },
        });
      }
    }

    allwoedKeys.forEach((key) => {
      const payload = req.body as User;
      if (key in payload) {
        user.set(key, payload[key]);
      }
    });
    console.log({ user: user });
    await user?.save();

    return res.send({
      success: true,
      data: user, // Consider if you want to return the updated document or not.
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

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id) {
    return res.status(400).send({
      success: false,
      error: {
        message: "Missing User id",
      },
    });
  }
  try {
    const id = req.params.id;
    const user = await UserModel.deleteOne({ _id: id });
    if (user.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        error: {
          message: "User not found",
        },
      });
    }
    return res.send({
      success: true,
      data: user, // Consider if you want to return the updated document or not.
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
