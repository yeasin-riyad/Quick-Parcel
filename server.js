import http from "http";
import dotenv from "dotenv";
import app from "./app.js";

import { connectDB } from "./config/db.js";
dotenv.config();

const PORT=process.env.PORT || 5030;

const startServer= async()=>{
    await connectDB();
     const server=http.createServer(app);
     server.listen(PORT,()=>{
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
     })
}

startServer().catch(err=>{
    console.error(`Error Starting Server: ${err.message}`);
    process.exit(1);
})