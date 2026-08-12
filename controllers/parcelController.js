import { Parcel } from "../models/Parcel.js";
import { createParcelSchema } from "../validations/validations.js";
import { calculateCost } from "../services/pricing.service.js";
import { generateTrackingId } from "../utils/generateTrackingId.js";

export const createParcel = async (req, res, next) => {
  try {
    // ------------------------------------
    // 1. Validate request body
    // ------------------------------------

    const { error, value } = createParcelSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // ------------------------------------
    // 2. Calculate parcel pricing
    // ------------------------------------

    const pricing = calculateCost({
      originCity: value.originCity,
      destinationCity: value.destinationCity,

      shipmentType: value.shipmentType,
      parcelCategory: value.parcelCategory,

      weight: value.weight,
      deliveryType: value.deliveryType,

      isRemoteArea: value.isRemoteArea || false,
      codAmount: value.codAmount || 0,
      discount: value.discount || 0,
    });

    // ------------------------------------
    // 3. Generate tracking ID
    // ------------------------------------

    const trackingId = generateTrackingId();

    if (!trackingId) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate tracking ID",
      });
    }

    // ------------------------------------
    // 4. Create parcel
    // ------------------------------------

    const parcel = await Parcel.create({
      ...value,

      trackingId,

      // Store complete pricing breakdown
      pricing,

      // --------------------------------
      // Initial checkpoint
      // --------------------------------
      checkpoints: [
        {
          location: value.originCity,

          status: "pending",

          title: `Parcel created at ${value.originCity} Branch`,

          description:
            `Your parcel has been successfully created at our ` +
            `${value.originCity} branch and is waiting for pickup.`,

          updatedBy: req.user
            ? req.user.name
            : "system",
        },
      ],
    });

    // ------------------------------------
    // 5. Response
    // ------------------------------------

    return res.status(201).json({
      success: true,
      message: "Parcel created successfully",

      data: {
        parcel,
      },
    });
  } catch (error) {
    next(error);
  }
};