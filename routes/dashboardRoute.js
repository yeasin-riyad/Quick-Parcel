import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';

const dashboardRouter=express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: |
 *       Returns aggregated dashboard statistics including total parcels,
 *       total users, total revenue, monthly parcel growth, monthly revenue,
 *       user growth, parcel status distribution and weight distribution.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     totals:
 *                       type: object
 *                       properties:
 *                         parcels:
 *                           type: integer
 *                           example: 1250
 *                         users:
 *                           type: integer
 *                           example: 340
 *                         revenue:
 *                           type: number
 *                           example: 425000
 *
 *                     monthlyParcels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: Aug
 *                           parcels:
 *                             type: integer
 *                             example: 120
 *
 *                     monthlyRevenue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: Aug
 *                           revenue:
 *                             type: number
 *                             example: 45000
 *
 *                     userGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: Aug
 *                           users:
 *                             type: integer
 *                             example: 35
 *
 *                     statusDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: delivered
 *                           count:
 *                             type: integer
 *                             example: 900
 *
 *                     weightDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           range:
 *                             type: string
 *                             example: "1"
 *                           count:
 *                             type: integer
 *                             example: 300
 *
 *       500:
 *         description: Internal server error
 */
dashboardRouter.get("/stats",protect,adminOnly, getDashboardStats);

export default dashboardRouter;