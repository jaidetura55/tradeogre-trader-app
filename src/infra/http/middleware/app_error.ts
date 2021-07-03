import { NextFunction, Request, Response } from "express";
import AppError from "../../../error/AppError";

export default async function app_error(
  error: Error,
  request: Request, 
  response: Response,
  _: NextFunction
) {
  console.error(error);

  if (error instanceof AppError) {
    return response.status(error.code).json({
      status: 'error',
      ...error,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}