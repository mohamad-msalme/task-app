import "./env";
import express, { NextFunction, Request, Response } from "express";
import hbs from "hbs";
import { PUBLIC_PATH, VIEWS_PATH, PARTIALS_PATH } from "./constants";
import { connectToDataBase } from "./db";
import { UserModel } from "./entities/User";
import { uploadPrivate } from "./multerConfig";
import { ensureDirectories } from "./setup";
import { AuthRouter } from "./routes/AuthRoute";
import { UserRoute } from "./routes/UserRoute";
import { TaskRoute } from "./routes/TaskRoute";
import { Authenticated } from "./middleware/auth";
import multer from "multer";
const cookieParser = require("cookie-parser");

// Initialize the express application
const app = express();

// Register hbs partials and set views
hbs.registerPartials(PARTIALS_PATH);
app.set("view engine", "hbs");
app.set("views", VIEWS_PATH);

// Middleware registrations
app.use(cookieParser());
app.use(express.static(PUBLIC_PATH));
app.use(express.json({ type: "application/json" }));
app.use(express.raw({ type: "application/octet-stream" }));
app.use(express.text({ type: "text/plain" }));

// Ensure necessary directories are created before starting the server
ensureDirectories();

async function main() {
  try {
    // Connect to the database
    await connectToDataBase();

    // Home route - simple hello world
    app.get("/", (req, res) => {
      res.send("Hello world");
    });

    // File upload route
    app.post("/upload/private", uploadPrivate.single("private"), (req, res) => {
      console.log(req.file);
      res.send("File uploaded successfully");
    });

    // Use routes
    app.use("/auth/jwt", AuthRouter);
    app.use("/users", Authenticated, UserRoute);
    app.use("/tasks", Authenticated, TaskRoute);

    // Generic request logging middleware
    app.use(async (req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      const users = await UserModel.find();
      res.send({ users });
    });

    // Error handling middleware
    app.use(function (
      err: unknown,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log({ err });
        return res.status(400).send({ error: err.message });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(500).send({ error: err });
      }

      // If this middleware function gets called without an error, it means there was no error
      // (you should not typically get here in the context of file uploading)
      next();
    });

    // Start listening on the specified port
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
}

main();

export default app;
