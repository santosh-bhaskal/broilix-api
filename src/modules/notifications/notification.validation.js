import Joi from "joi";

export const registerPushTokenSchema = Joi.object({
  token: Joi.string().trim().required(),
  deviceId: Joi.string().trim().max(255).allow("", null).optional(),
  platform: Joi.string().valid("ios", "android", "web").optional(),
});

export const unregisterPushTokenSchema = Joi.object({
  token: Joi.string().trim().required(),
});

export const sendTestNotificationSchema = Joi.object({
  title: Joi.string().trim().max(200).default("Broilix"),
  body: Joi.string().trim().max(1000).required(),
  data: Joi.object().unknown(true).default({}),
});
