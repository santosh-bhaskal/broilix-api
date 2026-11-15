import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("production", "development", "test").default("development"),
  PORT: Joi.number().default(5256),
  DATABASE_URL: Joi.string().required().description("PostgreSQL Connection String"),
  JWT_SECRET: Joi.string().required().description("JWT Secret Key"),
  JWT_ISSUER: Joi.string().default("ALONE"),
  JWT_AUDIENCE: Joi.string().default("ALONE"),
  JWT_EXPIRES_IN: Joi.string().default("60m"),
  LOG_LEVEL: Joi.string().default("info"),
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
    issuer: envVars.JWT_ISSUER,
    audience: envVars.JWT_AUDIENCE,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  logLevel: envVars.LOG_LEVEL,
};

export default config;
