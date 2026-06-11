import Joi from 'joi';
import { validatePasswordStrength } from './password';

export const taskCreateSchema = Joi.object({
  title: Joi.string().required().min(1).max(255).trim(),
  description: Joi.string().max(2000).optional().allow('', null),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  userId: Joi.string().uuid().optional().allow(null, ''),
  assignedRole: Joi.string().valid('ADMIN', 'USER').optional().allow(null, '')
});

export const taskUpdateSchema = taskCreateSchema.fork(
  ['title', 'status', 'priority'],
  schema => schema.optional()
);

export const authSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .custom((value, helpers) => {
      if (!validatePasswordStrength(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'Password strength validation')
    .required()
    .messages({ 'any.invalid': 'Password must be at least 8 characters with uppercase, lowercase, and a number' })
});

export const authLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
