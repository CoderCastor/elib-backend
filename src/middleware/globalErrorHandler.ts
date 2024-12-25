import { HttpError } from "http-errors";
import { config } from "../config/config";
import {  NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next:NextFunction
  
)=> {
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    message: err.message,
    errorStack: config.env === "development" ? err.stack : "",
  });
};

export default globalErrorHandler;
