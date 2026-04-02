import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Validating:", {
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
          meta: null,
        });
      }
      next(error);
    }
  };
};
