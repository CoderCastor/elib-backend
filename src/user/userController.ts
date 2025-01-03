import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  //database call
  try {
    const user = await userModel.findOne({ email: email }); //we can also write as userModel.findOne({email}) because key value pairs are same
    if (user) {
      const error = createHttpError(400, "User already exists with this email");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, `Error while getting user ${error}`));
  }

  //password hashing
  const hashedPassword = await bcrypt.hash(password, 10);
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, `Error while creating user ${error}`));
  }

  //Token Generation -JWT
  try {
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    //response
    res.json({
      accessToken: token,
    });
  } catch (error) {
    return next(
      createHttpError(500, `Error while signing the jwt token ${error}`)
    );
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if(!email || !password){
    return next(createHttpError(400,"All fields are required"))
  }

  //todo: write in try catch
  const user = await userModel.findOne({email})

  if(!user){
    return next(createHttpError(404, "User not found"))
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch){
    return next(createHttpError(400,"Username or password incorrect!"))
  }

  //todo : handle errors
  //create accessToken
  const token = sign({ sub: user._id }, config.jwtSecret as string, {
    expiresIn: "7d",
    algorithm: "HS256",
  });


  res.json({ accessToken: token })

};

export { createUser, loginUser };
