import mongoose from "mongoose";

const checkPointSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["arrived", "in_transit", "out_for_delivery", "delivared"],
      required: true,
    },
    timestamps: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const parcelSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  senderName: {
    type: String,
    required: true,
    trim: true,
  },

  senderPhone: {
    type: String,
    required: true,
    trim: true,
  },
  senderAddress: {
    type: String,
    required: true,
    trim: true,
  },
  receiverName: {
    type: String,
    required: true,
    trim: true,
  },
  receiverPhone: {
    type: String,
    required: true,
    trim: true,
  },
  receiverAddress: {
    type: String,
    required: true,
    trim: true,
  },
  shipmentType: {
    type: String,
    enum: ["national", "international"],
    required: true,
  },
  originCity: {
    type: String,
    required: true,
    trim: true,
  },
  destinationCity: {
    type: String,
    required: true,
    trim: true,
  },
  deliveryType: {
    type: String,
    enum: ["sameDay", "overnight", "standard"],
    required: true,
  },
  parcelCategory: {
    type: String,
    enum: [
      "document",
      "electronics",
      "fragile",
      "clothing",
      "food",
      "medicine",
      "cosmetics",
      "books",
      "small_package",
    ],
    required:true,
    trim:true
  },
  weight:{
    type:Number,
    required:true,
    min:0
  },
  price:{
    type:Number,
    required:true,
    min:0
  },
  checkpoints:{checkPointSchema}
},
{
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const Parcel=mongoose.model("Parcel",parcelSchema);