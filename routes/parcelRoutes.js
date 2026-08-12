import express from "express";

import {
    addCheckPoint,
  createParcel,
  getMyParcels,
  getParcelByTrackingId,
} from "../controllers/parcelController.js";

import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const parcelRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parcels
 *   description: Parcel creation, tracking and management
 */

/**
 * @swagger
 * /api/parcels:
 *   post:
 *     summary: Create a new parcel
 *     description: Creates a new parcel and automatically calculates the delivery price.
 *     tags:
 *       - Parcels
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderName
 *               - senderPhone
 *               - senderAddress
 *               - receiverName
 *               - receiverPhone
 *               - receiverAddress
 *               - shipmentType
 *               - originCity
 *               - destinationCity
 *               - deliveryType
 *               - parcelCategory
 *               - weight
 *             properties:
 *               senderName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Md. Yeasin Mazumder
 *
 *               senderPhone:
 *                 type: string
 *                 example: "01712345678"
 *
 *               senderAddress:
 *                 type: string
 *                 example: "Mirpur-12, Dhaka"
 *
 *               receiverName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Rahim Ahmed
 *
 *               receiverPhone:
 *                 type: string
 *                 example: "01812345678"
 *
 *               receiverAddress:
 *                 type: string
 *                 example: "Kotwali, Chattogram"
 *
 *               shipmentType:
 *                 type: string
 *                 enum:
 *                   - national
 *                   - international
 *                 example: national
 *
 *               originCity:
 *                 type: string
 *                 example: Dhaka
 *
 *               destinationCity:
 *                 type: string
 *                 example: Chattogram
 *
 *               deliveryType:
 *                 type: string
 *                 enum:
 *                   - sameDay
 *                   - overnight
 *                   - standard
 *                 example: overnight
 *
 *               parcelCategory:
 *                 type: string
 *                 enum:
 *                   - document
 *                   - electronics
 *                   - fragile
 *                   - clothing
 *                   - food
 *                   - medicine
 *                   - cosmetics
 *                   - books
 *                   - small_package
 *                   - large_package
 *                 example: electronics
 *
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 example: 2
 *
 *               isRemoteArea:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *
 *               codAmount:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 example: 1500
 *
 *     responses:
 *       201:
 *         description: Parcel created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.post("/", protect,adminOnly,createParcel);


/**
 * @swagger
 * /api/parcels:
 *   get:
 *     summary: Get my parcels
 *     description: Returns all parcels created by the authenticated user.
 *     tags:
 *       - Parcels
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Parcels retrieved successfully
 *
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.get("/", protect, getMyParcels);


/**
 * @swagger
 * /api/parcels/track/{trackingId}:
 *   get:
 *     summary: Track a parcel
 *     description: Returns the current status and tracking history of a parcel using its tracking ID.
 *     tags:
 *       - Parcels
 *
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique parcel tracking ID
 *         example: QP20260812ABC123
 *
 *     responses:
 *       200:
 *         description: Parcel tracking information retrieved successfully
 *
 *       404:
 *         description: Parcel not found
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.get(
  "/track/:trackingId",
  getParcelByTrackingId
);

parcelRouter.post(
  "/:trackingId/checkpoints",
  protect,
  adminOnly,
  addCheckPoint,
);


export default parcelRouter;