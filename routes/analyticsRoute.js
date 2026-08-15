import express from "express";

import {
  getRevenueAnalytics,
  getParcelGrowth,
  getTopCities,
  getDeliveryPerformance,
  getAnalyticsSummary,
} from "../controllers/analyticsController.js";

import {
  protect,
  adminOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Parcel delivery and business analytics
 */

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     description: Returns an overall summary of parcel delivery performance including total parcels, delivery status counts, revenue and success rates.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalParcels:
 *                       type: integer
 *                       example: 1250
 *                     delivered:
 *                       type: integer
 *                       example: 850
 *                     pending:
 *                       type: integer
 *                       example: 100
 *                     inTransit:
 *                       type: integer
 *                       example: 150
 *                     outForDelivery:
 *                       type: integer
 *                       example: 50
 *                     failed:
 *                       type: integer
 *                       example: 40
 *                     returned:
 *                       type: integer
 *                       example: 60
 *                     revenue:
 *                       type: number
 *                       example: 525000
 *                     successRate:
 *                       type: number
 *                       example: 68
 *                     failureRate:
 *                       type: number
 *                       example: 3.2
 *                     returnRate:
 *                       type: number
 *                       example: 4.8
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/summary",
  protect,
  adminOnly,
  getAnalyticsSummary,
);

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get monthly revenue analytics
 *     description: Returns revenue generated for each of the last 12 months.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly revenue analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Aug
 *                       revenue:
 *                         type: number
 *                         example: 45000
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/revenue",
  protect,
  adminOnly,
  getRevenueAnalytics,
);

/**
 * @swagger
 * /api/analytics/parcel-growth:
 *   get:
 *     summary: Get parcel growth analytics
 *     description: Returns the number of parcels created per month for the requested number of recent months.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of recent months to return. Maximum 20.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 8
 *         example: 8
 *     responses:
 *       200:
 *         description: Parcel growth analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Aug
 *                       parcels:
 *                         type: integer
 *                         example: 120
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/parcel-growth",
  protect,
  adminOnly,
  getParcelGrowth,
);

/**
 * @swagger
 * /api/analytics/top-cities:
 *   get:
 *     summary: Get top destination cities
 *     description: Returns the destination cities with the highest number of parcels.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of top destination cities to return. Maximum 20.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 8
 *         example: 5
 *     responses:
 *       200:
 *         description: Top destination cities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                         example: Dhaka
 *                       parcels:
 *                         type: integer
 *                         example: 450
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/top-cities",
  protect,
  adminOnly,
  getTopCities,
);

/**
 * @swagger
 * /api/analytics/delivery-performance:
 *   get:
 *     summary: Get delivery performance analytics
 *     description: Returns monthly delivery performance for the last 12 months, including delivered, failed, returned parcels and their respective rates.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Aug
 *                       total:
 *                         type: integer
 *                         example: 200
 *                       delivered:
 *                         type: integer
 *                         example: 150
 *                       failed:
 *                         type: integer
 *                         example: 10
 *                       returned:
 *                         type: integer
 *                         example: 8
 *                       successRate:
 *                         type: number
 *                         example: 75
 *                       failureRate:
 *                         type: number
 *                         example: 5
 *                       returnRate:
 *                         type: number
 *                         example: 4
 *       401:
 *         description: Unauthorized - authentication token missing or invalid
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/delivery-performance",
  protect,
  adminOnly,
  getDeliveryPerformance,
);

export default router;