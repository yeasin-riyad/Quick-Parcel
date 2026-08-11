import rateLimit from "express-rate-limit"

//Global Api Rate Limiter
export const globalLimiter=  rateLimit({
    windowMs:15*60*1000 ,//15 minutes
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        message:"Too many requests from this IP, please try again after 15 minutes"
    }

})

export const authLimiter=  rateLimit({
    windowMs:15*60*1000 ,//15 minutes
    max:20,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        message:"Too many authentication attempts from this IP, please try again after 15 minutes"
    }

})