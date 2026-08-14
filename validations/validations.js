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

export const createParcelSchema = joi.object({
  senderName: joi.string().trim().min(3).max(100).required(),

  senderPhone: joi.string().trim().required(),

  senderAddress: joi.string().trim().min(5).max(500).required(),

  receiverName: joi.string().trim().min(3).max(100).required(),

  receiverPhone: joi.string().trim().required(),

  receiverAddress: joi.string().trim().min(5).max(500).required(),

  shipmentType: joi.string().valid("national", "international").required(),

  originCity: joi.string().trim().min(2).max(100).required(),

  destinationCity: joi.string().trim().min(2).max(100).required(),

  deliveryType: joi
    .string()
    .valid("sameDay", "overnight", "standard")
    .required(),

  parcelCategory: joi
    .string()
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

  weight: joi.number().positive().max(100).required(),

  isRemoteArea: joi.boolean().default(false),

  codAmount: joi.number().min(0).default(0),
});

export const addCheckpointSchema = joi.object({
  location: joi.string().trim().min(2).max(150).required(),

  title: joi.string().trim().min(3).max(200).required(),

  description: joi.string().trim().max(500).allow("").optional(),

  status: joi
    .string()
    .valid(
      "pending",
      "picked_up",
      "arrived_at_hub",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
      "returned",
    )
    .required(),
});

export const calculateCostSchema = joi.object({
  originCity: joi.string().trim().min(2).max(100).required(),

  destinationCity: joi.string().trim().min(2).max(100).required(),

  shipmentType: joi.string().valid("national", "international").required(),

  parcelCategory: joi
    .string()
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

  weight: joi.number().positive().max(100).required(),

  deliveryType: joi
    .string()
    .valid("sameDay", "overnight", "standard")
    .required(),

  isRemoteArea: joi.boolean().default(false),

  codAmount: joi.number().min(0).default(0),
});
