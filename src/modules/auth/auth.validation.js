import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const signupSchema = Joi.object({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().optional(),
  Email: Joi.string().email().optional(),
  password: Joi.string().required(),
  Password: Joi.string().optional(),
}).or("email", "Email");

export default {
  loginSchema,
  signupSchema,
  resetPasswordSchema,
};
