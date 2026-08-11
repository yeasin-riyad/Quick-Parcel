import express from "express";
import { addUser, login } from "../controllers/authController.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  adminOnly,
  protect,
} from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for Admin authentication and management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an admin user
 *     description: Authenticates an admin using email and password and returns a JWT token.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Admin password
 *                 example: password123
 *
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Invalid email or password
 *
 *       500:
 *         description: Internal server error
 */
authRouter.post(
  "/login",
  authLimiter,
  login
);

/**
 * @swagger
 * /api/auth/add-user:
 *   post:
 *     summary: Add a new admin user
 *     description: Creates a new admin user account. Requires admin authentication.
 *     tags:
 *       - Authentication
 *
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
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Admin name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: Admin password
 *                 example: password123
 *
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *
 *       400:
 *         description: Validation error or user already exists
 *
 *       401:
 *         description: Unauthorized - token missing or invalid
 *
 *       403:
 *         description: Access denied - admins only
 *
 *       500:
 *         description: Internal server error
 */
authRouter.post(
  "/add-user",
  protect,
  adminOnly,
  addUser
);

export default authRouter;