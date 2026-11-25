import { AppDataSource } from "../../core/database/dbConnect.js";
import { generateToken } from "../../core/utils/jwtHelper.js";
import ApiError from "../../core/utils/ApiError.js";
import logger from "../../core/utils/logger.js";

const getUserRepository = () => AppDataSource.getRepository("User");

export const login = async (body) => {
  const email = body.email;
  const password = body.password;

  logger.info(`Login attempt for email: ${email}`);

  const userRepo = getUserRepository();
  const user = await userRepo.findOne({
    where: { email },
  });

  if (!user) {
    logger.warn(`Login failed: User with email ${email} not found.`);
    throw ApiError.unauthorized("Invalid email or password.");
  }

  if (user.password !== password) {
    logger.warn(`Login failed: Incorrect password for email ${email}.`);
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const token = generateToken(user);
  logger.info(`Login successful for email: ${email}`);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName,
      email: user.email,
    },
  };
};

export const signup = async (body) => {
  const firstName = (body.firstName || "").trim();
  const lastName = (body.lastName || "").trim();
  const email = body.email;
  const password = body.password;

  logger.info(`SignUp attempt for email: ${email}`);

  if (!firstName || !lastName || !email || !password) {
    throw ApiError.badRequest("First name, last name, email, and password are required.");
  }

  const userRepo = getUserRepository();
  const existingUser = await userRepo.findOne({
    where: { email },
  });

  if (existingUser) {
    logger.warn(`SignUp failed: Email ${email} already exists.`);
    throw ApiError.badRequest("Email already exists.");
  }

  const user = userRepo.create({
    firstName,
    lastName,
    email,
    password,
  });

  await userRepo.save(user);
  logger.info(`User signed up successfully: ${email}`);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    message: "User signed up successfully.",
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName,
      email: user.email,
    },
  };
};

export const resetPassword = async (body) => {
  const email = body.email || body.Email;
  const password = body.password || body.Password;

  logger.info(`Password reset attempt for email: ${email}`);

  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required.");
  }

  const userRepo = getUserRepository();
  const user = await userRepo.findOne({
    where: { email },
  });

  if (!user) {
    logger.warn(`Password reset failed: User with email ${email} not found.`);
    throw ApiError.notFound("User with this email not found.");
  }

  user.password = password;
  await userRepo.save(user);
  logger.info(`Password updated successfully for email: ${email}`);

  return {
    message: "Password updated successfully.",
  };
};

export default {
  login,
  signup,
  resetPassword,
};
