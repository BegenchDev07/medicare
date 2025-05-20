import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Middleware to validate request body
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });    
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
    
    next();
  };
};