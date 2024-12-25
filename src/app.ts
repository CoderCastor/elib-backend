import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

app.get("/", (req, res,next) => {


  res.json({
    message: "Welcome to Elib APIs",
  });
});

app.use(globalErrorHandler);

export default app;
