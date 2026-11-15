import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  Email: Joi.string().email().optional(),
  password: Joi.string().required(),
  Password: Joi.string().optional(),
}).or("email", "Email");

export const signupSchema = Joi.object({
  firstName: Joi.string().allow("").optional(),
  FirstName: Joi.string().allow("").optional(),
  lastName: Joi.string().allow("").optional(),
  LastName: Joi.string().allow("").optional(),
  email: Joi.string().email().optional(),
  Email: Joi.string().email().optional(),
  password: Joi.string().required(),
  Password: Joi.string().optional(),
}).or("email", "Email");

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
