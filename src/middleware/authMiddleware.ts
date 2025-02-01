import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "../config/constants";
import { ErrorMessages } from "../errors/ErrorMessages";
import { AppError } from "../errors/AppError";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
      let walletAddress: string | null = null;

      // Step 1: Check for JWT in cookies
      const token = req.cookies[COOKIE_NAME];
      if (token) {
          try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { walletAddress: string; signature: string; timestamp: number };
              walletAddress = decoded.walletAddress;
          } catch (err) {
              throw new AppError(401, ErrorMessages.INVALID_JWT_TOKEN);
          }
      }

      // Step 2: If no valid cookie, reject request
      if (!walletAddress) {
        throw new AppError(401, ErrorMessages.MISSING_JWT_TOKEN);
      }

      // Attach walletAddress to request for use in routes
      (req as any).user = { walletAddress };

      next();
};
