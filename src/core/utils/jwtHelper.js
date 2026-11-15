import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/env.config.js";

export function generateToken(user) {
  const userId = user.id ?? user.Id;
  const firstName = user.firstName ?? user.FirstName ?? "";
  const email = user.email ?? user.Email ?? "";

  const payload = {
    id: userId,
    name: firstName,
    email: email,
    jti: crypto.randomUUID(),

    // ASP.NET claim type compatibility
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": String(userId),
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": firstName,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
}

export default {
  generateToken,
  verifyToken,
};
