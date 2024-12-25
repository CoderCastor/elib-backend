import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

app.get("/", (req, res) => {


  res.json({
    message: "Welcome to Elib APIs",
  });
});

app.use('/api/users',userRouter)

app.use(globalErrorHandler);

export default app;
