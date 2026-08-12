import joi from "joi";

//Login Validation
export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const addUserSchema = joi.object({
  name: joi.string().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const createParcelSchema = Joi.object({
  senderName: Joi.string().trim().min(3).max(100).required(),
  senderPhone: Joi.string().trim().required(),
  senderAddress: Joi.string().trim().min(5).max(500).required(),
  receiverName: Joi.string().trim().min(3).max(100).required(),
  receiverPhone: Joi.string().trim().required(),
  receiverAddress: Joi.string().trim().min(5).max(500).required(),
  shipmentType: Joi.string().valid("national", "international").required(),
  originCity: Joi.string().trim().min(2).max(100).required(),
  destinationCity: Joi.string().trim().min(2).max(100).required(),
  deliveryType: Joi.string()
    .valid("sameDay", "overnight", "standard")
    .required(),
  parcelCategory: Joi.string()
    .valid(
      "document",
      "electronics",
      "fragile",
      "clothing",
      "food",
      "medicine",
      "cosmetics",
      "books",
      "small_package",
      "large_package",
    )
    .required(),

  weight: Joi.number().positive().max(100).required(),
  isRemoteArea: Joi.boolean().default(false),
  codAmount: Joi.number().min(0).default(0),
});
