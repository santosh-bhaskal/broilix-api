import { validationErrorResponse } from "../utils/response.js";

const validate = (schema) => (req, res, next) => {
  if (!schema) return next();

  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const formattedErrors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message.replace(/['"]/g, ""),
    }));
    return validationErrorResponse(res, formattedErrors);
  }

  next();
};

export default validate;
