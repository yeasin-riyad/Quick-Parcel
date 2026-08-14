import { Parcel } from "../models/Parcel.js";
import { addCheckpointSchema, calculateCostSchema, createParcelSchema } from "../validations/validations.js";
import { calculateCost } from "../services/calculateCost.js";
import { generateTrackingId } from "../services/generateTrackingId.js";
import { STATUS_TRANSITIONS } from "../config/statusTransitions.js";

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
      currentStatus:"pending",

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


    const { error, value } =
      addCheckpointSchema.validate(req.body);

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

    const currentStatus = parcel.currentStatus;

    // Requested new status
    const nextStatus = value.status;

    if (currentStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update parcel. Parcel has already been delivered.",
      });
    }

    if (currentStatus === "returned") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update parcel. Parcel has already been returned.",
      });
    }

    const allowedNextStatuses =
      STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${currentStatus} → ${nextStatus}`,

        data: {
          currentStatus,
          requestedStatus: nextStatus,
          allowedStatuses: allowedNextStatuses,
        },
      });
    }

    const checkpoint = {
      location: value.location,

      title: value.title,

      description: value.description || "",

      status: nextStatus,

      timestamp: new Date(),

      updatedBy: req.user?.name || "system",
    };

    parcel.checkpoints.push(checkpoint);

    parcel.currentStatus = nextStatus;

    await parcel.save();

    return res.status(201).json({
      success: true,

      message: "Checkpoint added successfully",

      data: {
        checkpoint,

        currentStatus: parcel.currentStatus,

        trackingId: parcel.trackingId,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const getAllParcels = async (req, res, next) => {
  try {
    /*
     * ------------------------------------
     * 1. Pagination
     * ------------------------------------
     */

    const page = Math.max(Number.parseInt(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit) || 10, 1),
      100,
    );

    const skip = (page - 1) * limit;

    /*
     * ------------------------------------
     * 2. Search
     * ------------------------------------
     *
     * Example:
     * ?search=Dhaka
     * ?search=Rahim
     * ?search=QP2026
     */

    const search = req.query.search?.trim();

    /*
     * ------------------------------------
     * 3. Filtering
     * ------------------------------------
     */

    const {
      shipmentType,
      deliveryType,
      parcelCategory,
      currentStatus,
      isRemoteArea,
      originCity,
      destinationCity,
      minPrice,
      maxPrice,
      minWeight,
      maxWeight,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    /*
     * Shipment type
     */

    if (shipmentType) {
      filter.shipmentType = shipmentType;
    }

    /*
     * Delivery type
     */

    if (deliveryType) {
      filter.deliveryType = deliveryType;
    }

    /*
     * Parcel category
     */

    if (parcelCategory) {
      filter.parcelCategory = parcelCategory;
    }

    /*
     * Current parcel status
     */

    if (currentStatus) {
      filter.currentStatus = currentStatus;
    }

    /*
     * Remote area
     *
     * ?isRemoteArea=true
     */

    if (isRemoteArea !== undefined) {
      filter.isRemoteArea = isRemoteArea === "true";
    }

    /*
     * Origin city
     */

    if (originCity) {
      filter.originCity = {
        $regex: originCity,
        $options: "i",
      };
    }

    /*
     * Destination city
     */

    if (destinationCity) {
      filter.destinationCity = {
        $regex: destinationCity,
        $options: "i",
      };
    }

    /*
     * ------------------------------------
     * 4. Price filter
     * ------------------------------------
     *
     * ?minPrice=100
     * ?maxPrice=1000
     */

    if (minPrice || maxPrice) {
      filter["pricing.total"] = {};

      if (minPrice) {
        filter["pricing.total"].$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter["pricing.total"].$lte = Number(maxPrice);
      }
    }

    /*
     * ------------------------------------
     * 5. Weight filter
     * ------------------------------------
     *
     * ?minWeight=1
     * ?maxWeight=10
     */

    if (minWeight || maxWeight) {
      filter.weight = {};

      if (minWeight) {
        filter.weight.$gte = Number(minWeight);
      }

      if (maxWeight) {
        filter.weight.$lte = Number(maxWeight);
      }
    }

    /*
     * ------------------------------------
     * 6. Date filter
     * ------------------------------------
     *
     * ?startDate=2026-08-01
     * ?endDate=2026-08-12
     */

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);

        // Include the entire end date
        end.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = end;
      }
    }

    /*
     * ------------------------------------
     * 7. Search
     * ------------------------------------
     *
     * Search fields:
     * - trackingId
     * - senderName
     * - senderPhone
     * - receiverName
     * - receiverPhone
     * - originCity
     * - destinationCity
     */

    if (search) {
      filter.$or = [
        {
          trackingId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          senderName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          senderPhone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          receiverName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          receiverPhone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          originCity: {
            $regex: search,
            $options: "i",
          },
        },
        {
          destinationCity: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /*
     * ------------------------------------
     * 8. Sorting
     * ------------------------------------
     *
     * Examples:
     *
     * ?sort=createdAt
     * ?sort=-createdAt
     * ?sort=pricing.total
     * ?sort=-weight
     *
     * "-" means descending.
     */

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "trackingId",
      "weight",
      "pricing.total",
      "codAmount",
      "originCity",
      "destinationCity",
    ];

    let sort = "-createdAt";

    if (req.query.sort) {
      const requestedSort = req.query.sort;

      const sortField = requestedSort.startsWith("-")
        ? requestedSort.substring(1)
        : requestedSort;

      if (allowedSortFields.includes(sortField)) {
        sort = requestedSort;
      }
    }

    /*
     * ------------------------------------
     * 9. Field selection
     * ------------------------------------
     *
     * ?fields=trackingId,senderName,currentStatus,pricing
     */

    let projection = undefined;

    if (req.query.fields) {
      const requestedFields = req.query.fields
        .split(",")
        .map((field) => field.trim())
        .filter(Boolean);

      projection = requestedFields.join(" ");
    }

    /*
     * ------------------------------------
     * 10. Query database
     * ------------------------------------
     */

    const [parcels, total] = await Promise.all([
      Parcel.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Parcel.countDocuments(filter),
    ]);

    /*
     * ------------------------------------
     * 11. Pagination metadata
     * ------------------------------------
     */

    const totalPages = Math.ceil(total / limit);

    /*
     * ------------------------------------
     * 12. Response
     * ------------------------------------
     */

    return res.status(200).json({
      success: true,
      message: "Parcels retrieved successfully",

      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      filters: {
        search: search || null,
        shipmentType: shipmentType || null,
        deliveryType: deliveryType || null,
        parcelCategory: parcelCategory || null,
        currentStatus: currentStatus || null,
        isRemoteArea:
          isRemoteArea !== undefined
            ? isRemoteArea === "true"
            : null,
        originCity: originCity || null,
        destinationCity: destinationCity || null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        minWeight: minWeight ? Number(minWeight) : null,
        maxWeight: maxWeight ? Number(maxWeight) : null,
      },

      data: parcels,
    });
  } catch (error) {
    next(error);
  }
};


export const calculateCostCalculator = async (req, res, next) => {
  try {
    const { error, value } = calculateCostSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const pricing = calculateCost({
      originCity: value.originCity,
      destinationCity: value.destinationCity,
      shipmentType: value.shipmentType,
      parcelCategory: value.parcelCategory,
      weight: value.weight,
      deliveryType: value.deliveryType,
      isRemoteArea: value.isRemoteArea,
      codAmount: value.codAmount,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery cost calculated successfully.",
      data: pricing,
    });
  } catch (error) {
    next(error);
  }
};