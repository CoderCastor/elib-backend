import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //database call
  const user = await userModel.findOne({ email: email }); //we can also write as userModel.findOne({email}) because key value pairs are same

  if (user) {
    const error = createHttpError(400, "User already exists with this email");
    return next(error);
  }

  //password hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  //Token Generation -JWT
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  //response
  res.json({
    accessToken: token,
  });
};

export { createUser };
