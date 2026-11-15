import { randomUUID } from "crypto";

export const requestId = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  res.locals = res.locals || {};
  res.locals.requestId = req.id;
  next();
};

export default requestId;
