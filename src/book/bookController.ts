import path from "node:path";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from 'node:fs'

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const {title,genre} = req.body

  console.log("Files", req.files);

  const files = req.files as { [filename: string]: Express.Multer.File[] };

  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    //for cover image
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    //for pdf
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-Pdfs",
        format: "pdf",
      }
    );

    console.log("UploadResult", uploadResult);
    console.log("PDF_Upload_Result", bookFileUploadResult);

    const newBook = await bookModel.create({
        title,
        genre,
        author:"676be15a4667c24836b173ac",
        coverImage: uploadResult.secure_url,
        file: bookFileUploadResult.secure_url
    })

    //delete Temp files
    await fs.promises.unlink(filePath)
    await fs.promises.unlink(bookFilePath)


    res.status(201).json({
      id: newBook._id
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error while uploading the files."));
  }
};

export { createBook };
