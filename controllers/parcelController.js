import { Parcel } from "../models/Parcel.js";
import { addCheckpointSchema, createParcelSchema } from "../validations/validations.js";
import { calculateCost } from "../services/calculateCost.js";
import { generateTrackingId } from "../services/generateTrackingId.js";

export const createParcel = async (req, res, next) => {
  try {
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

export const getMyParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: parcels.length,
      data: parcels,
    });
  } catch (error) {
    next(error);
  }
};


export const getParcelByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    const parcel = await Parcel.findOne({
      trackingId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

export const addCheckPoint = async (req, res, next) => {
  try {

    const { trackingId } = req.params;


    const { error, value } = addCheckpointSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }


    const parcel = await Parcel.findOne({
      trackingId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    const checkpoint = {
      location: value.location,
      title: value.title,
      description: value.description || "",
      status: value.status,
      timestamp: new Date(),
      updatedBy: req.user?.name || "system",
    };
    parcel.checkpoints.push(checkpoint);
    await parcel.save();
    return res.status(201).json({
      success: true,
      message: "Checkpoint added successfully",

      data: {
        checkpoint,
        parcel,
      },
    });
  } catch (error) {
    next(error);
  }
};