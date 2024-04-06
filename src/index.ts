import "./env";
import hbs from "hbs";
import { PUBLIC_PATH, VIEWS_PATH, PARTIALS_PATH } from "./constants";
import express from "express";

const cookieParser = require("cookie-parser");

const app = express();
hbs.registerPartials(PARTIALS_PATH);
const main = () => {
  app.use(cookieParser());
  app.use(express.static(PUBLIC_PATH));
  app.use(express.json({ type: "application/json" }));
  app.use(express.raw({ type: "application/octet-stream" }));
  app.use(express.text({ type: "text/plain" }));

  app.set("view engine", "hbs");
  app.set("views", VIEWS_PATH);
  // Routes
  app.get("/", (req, res, next) => {
    console.log({ reqApp: req.baseUrl });
    res.send("Hello world");
  });

  app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
  });
};

export default app;

main();
