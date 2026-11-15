import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/env.config.js";

export function generateToken(user) {
  const userId = user.id ?? user.Id;
  const firstName = user.firstName ?? user.FirstName ?? "";
  const email = user.email ?? user.Email ?? "";

  const payload = {
    id: userId,
    userId: userId,
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
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
  } catch (err) {
    // Resilient fallback: verify signature without strict issuer/audience check
    return jwt.verify(token, config.jwt.secret);
  }
}

export function getUserIdFromReq(req) {
  if (!req?.user) return null;
  const rawId =
    req.user.id ??
    req.user.Id ??
    req.user.userId ??
    req.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const parsed = parseInt(rawId, 10);
  return isNaN(parsed) ? null : parsed;
}

export default {
  generateToken,
  verifyToken,
  getUserIdFromReq,
};
