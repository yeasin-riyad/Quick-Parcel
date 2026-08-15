import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: "3.0.0",

  info: {
    title: "Courier Delivery API",
    version: "1.0.0",
    description:
      "API documentation for the Courier Delivery Web Application",
  },

  servers: [
    {
      url: "https://quick-parcel.onrender.com/api",
      description: "Production Server",
    },
    // {
    //   url: `http://localhost:${process.env.PORT || 5030}/api`,
    //   description: "Development Server",
    // },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
     "./routes/*.js",
  ],

//   apis: [
//     path.join(__dirname, "../routes/*.js"),
//   ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;