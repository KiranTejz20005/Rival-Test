import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authSignupSchema, authLoginSchema } from '../utils/validators';
import Joi from 'joi';

const router = Router();

router.post('/signup', validate(authSignupSchema), authController.signup);
router.post('/login', validate(authLoginSchema), authController.login);

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

router.post('/refresh', validate(refreshSchema), authController.refresh);

export default router;
