import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log(path.join(__dirname, "../routes/*.js"))

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
      url: `http://localhost:${process.env.PORT || 5030}`,
      description: "Development Server",
    },
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
  swaggerDefinition,
    //   apis:['./routes/*.js'], //Path to the API docs


  apis: [
    path.join(__dirname, "../routes/*.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;