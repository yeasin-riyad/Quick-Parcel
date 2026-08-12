import express from "express";

import {
  addCheckPoint,
  createParcel,
  getAllParcels,
  getMyParcels,
  getParcelByTrackingId,
} from "../controllers/parcelController.js";

import {
  adminOnly,
  protect,
} from "../middlewares/authMiddleware.js";

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
 *     description: Creates a new parcel and automatically calculates its delivery price.
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
 *                 minLength: 5
 *                 maxLength: 500
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
 *                 minLength: 5
 *                 maxLength: 500
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
 *                 minimum: 0.1
 *                 maximum: 100
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
 *       403:
 *         description: Forbidden - admin access required
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.post(
  "/",
  protect,
  adminOnly,
  createParcel
);


/**
 * @swagger
 * /api/parcels:
 *   get:
 *     summary: Get my parcels
 *     description: Returns all parcels associated with the authenticated user.
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
parcelRouter.get(
  "/",
  protect,
  getMyParcels
);


/**
 * @swagger
 * /api/parcels/all:
 *   get:
 *     summary: Get all parcels
 *     description: Returns all parcels for administrators with pagination, searching, filtering and sorting support.
 *     tags:
 *       - Parcels
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of parcels per page. Maximum 100.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search by tracking ID, sender name, sender phone, receiver name, receiver phone, origin city or destination city.
 *         schema:
 *           type: string
 *         example: Dhaka
 *
 *       - in: query
 *         name: shipmentType
 *         required: false
 *         description: Filter parcels by shipment type.
 *         schema:
 *           type: string
 *           enum:
 *             - national
 *             - international
 *         example: national
 *
 *       - in: query
 *         name: deliveryType
 *         required: false
 *         description: Filter parcels by delivery type.
 *         schema:
 *           type: string
 *           enum:
 *             - sameDay
 *             - overnight
 *             - standard
 *         example: overnight
 *
 *       - in: query
 *         name: parcelCategory
 *         required: false
 *         description: Filter parcels by parcel category.
 *         schema:
 *           type: string
 *           enum:
 *             - document
 *             - electronics
 *             - fragile
 *             - clothing
 *             - food
 *             - medicine
 *             - cosmetics
 *             - books
 *             - small_package
 *             - large_package
 *         example: electronics
 *
 *       - in: query
 *         name: currentStatus
 *         required: false
 *         description: Filter parcels by current delivery status.
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - picked_up
 *             - arrived_at_hub
 *             - in_transit
 *             - out_for_delivery
 *             - delivered
 *             - failed
 *             - returned
 *         example: in_transit
 *
 *       - in: query
 *         name: isRemoteArea
 *         required: false
 *         description: Filter parcels based on whether the destination is a remote area.
 *         schema:
 *           type: boolean
 *         example: true
 *
 *       - in: query
 *         name: originCity
 *         required: false
 *         description: Filter parcels by origin city.
 *         schema:
 *           type: string
 *         example: Dhaka
 *
 *       - in: query
 *         name: destinationCity
 *         required: false
 *         description: Filter parcels by destination city.
 *         schema:
 *           type: string
 *         example: Chattogram
 *
 *       - in: query
 *         name: minPrice
 *         required: false
 *         description: Minimum parcel price in BDT.
 *         schema:
 *           type: number
 *           minimum: 0
 *         example: 200
 *
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         description: Maximum parcel price in BDT.
 *         schema:
 *           type: number
 *           minimum: 0
 *         example: 1500
 *
 *       - in: query
 *         name: minWeight
 *         required: false
 *         description: Minimum parcel weight in kilograms.
 *         schema:
 *           type: number
 *           minimum: 0
 *         example: 1
 *
 *       - in: query
 *         name: maxWeight
 *         required: false
 *         description: Maximum parcel weight in kilograms.
 *         schema:
 *           type: number
 *           minimum: 0
 *         example: 10
 *
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: Return parcels created from this date.
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-08-01
 *
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: Return parcels created until this date.
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-08-12
 *
 *       - in: query
 *         name: sort
 *         required: false
 *         description: Sort parcels. Prefix the field with '-' for descending order.
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - -createdAt
 *             - updatedAt
 *             - -updatedAt
 *             - trackingId
 *             - -trackingId
 *             - weight
 *             - -weight
 *             - pricing.total
 *             - -pricing.total
 *             - codAmount
 *             - -codAmount
 *         example: -createdAt
 *
 *       - in: query
 *         name: fields
 *         required: false
 *         description: Select specific fields to return. Separate fields with commas.
 *         schema:
 *           type: string
 *         example: trackingId,senderName,receiverName,currentStatus,pricing
 *
 *     responses:
 *       200:
 *         description: All parcels retrieved successfully
 *
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *
 *       403:
 *         description: Forbidden - admin access required
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.get(
  "/all",
  protect,
  adminOnly,
  getAllParcels
);


/**
 * @swagger
 * /api/parcels/track/{trackingId}:
 *   get:
 *     summary: Track a parcel
 *     description: Returns the current status and complete tracking history of a parcel using its tracking ID. This endpoint does not require authentication.
 *     tags:
 *       - Parcels
 *
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         description: Unique parcel tracking ID
 *         schema:
 *           type: string
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


/**
 * @swagger
 * /api/parcels/{trackingId}/checkpoints:
 *   post:
 *     summary: Add a parcel checkpoint
 *     description: Adds a new tracking checkpoint and updates the parcel's current status. Only authenticated administrators can update parcel status. Status transitions are validated according to the parcel's current status.
 *     tags:
 *       - Parcels
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         description: Unique parcel tracking ID
 *         schema:
 *           type: string
 *         example: QP20260812ABC123
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - title
 *               - status
 *             properties:
 *               location:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: Mirpur Branch, Dhaka
 *
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: Parcel Picked Up
 *
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Parcel has been successfully picked up from the sender's address.
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - picked_up
 *                   - arrived_at_hub
 *                   - in_transit
 *                   - out_for_delivery
 *                   - delivered
 *                   - failed
 *                   - returned
 *                 example: picked_up
 *
 *     responses:
 *       201:
 *         description: Checkpoint added successfully and parcel status updated
 *
 *       400:
 *         description: Invalid request or invalid status transition
 *
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *
 *       403:
 *         description: Forbidden - admin access required
 *
 *       404:
 *         description: Parcel not found
 *
 *       500:
 *         description: Internal server error
 */
parcelRouter.post(
  "/:trackingId/checkpoints",
  protect,
  adminOnly,
  addCheckPoint
);

export default parcelRouter;