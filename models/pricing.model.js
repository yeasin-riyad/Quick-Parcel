import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    weightCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    categoryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryTypeCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    remoteAreaCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    codCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["BDT", "USD"],
      default: "BDT",
    },
  },
  {
    _id: false,
  },
);

export default pricingSchema;