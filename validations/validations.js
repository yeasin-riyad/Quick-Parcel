import joi from "joi";

//Login Validation
export const loginSchema= joi.object({
    email:joi.string().email().required(),
    password:joi.string().min(6).required()
})

export const addUserSchema=joi.object({
    name:joi.string().min(3).max(30).required(),
     email:joi.string().email().required(),
    password:joi.string().min(6).required()

})