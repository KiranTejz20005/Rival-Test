import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const target = source === 'body' ? req.body : req.query;
    const { error, value } = schema.validate(target, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));
      return res.status(400).json({ error: 'Validation failed', status: 400, details, timestamp: new Date().toISOString() });
    }
    if (source === 'body') {
      req.body = value;
    }
    next();
  };
};

export const validateParam = (schema: Joi.StringSchema, paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params[paramName]);
    if (error) {
      return res.status(400).json({ error: `Invalid ${paramName}`, status: 400, timestamp: new Date().toISOString() });
    }
    next();
  };
};
