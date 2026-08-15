import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import authRouter from './routes/authRoutes.js';
import parcelRouter from "./routes/parcelRoutes.js";
import dashboardRouter from './routes/dashboardRoute.js';


dotenv.config();
const app=express();


app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());

//Global Rate Limiter
app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Quick Parcel API is running",
  });
});

app.use("/api/docs",swaggerUI.serve,swaggerUI.setup(swaggerSpec));

app.get("/health",(req,res)=>{
    res.status(200).json({status:"ok",message:"Server is healthy."});
})

app.use("/api/auth",authRouter)
app.use("/api/parcels", parcelRouter);
app.use("/api/dashboard", dashboardRouter);


app.use(notFoundHandler);
app.use(errorHandler);



export default app;