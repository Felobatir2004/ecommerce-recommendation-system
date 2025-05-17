import joi from "joi"
import { generalField } from "../../middlewares/validation.middleware.js"
export const registerSchema = joi.object({
    userName:generalField.userName.required(),
    email:generalField.email.required(),
    password:generalField.password.required(),
    confirmPassword:generalField.confirmPassword.required(),
    gender:generalField.gender,
    role:generalField.role,
    mobileNumber:generalField.mobileNumber.required(),
})

export const confirmEmailSchema = joi
.object({
    email: generalField.email.required(),
    code: generalField.code.required()
}).required()

export const signInSchema = joi
.object({
    email: generalField.email.required(),
    password: generalField.password.required(),
}).required()

export const forgetPasswordSchema = joi
.object({
    email: generalField.email.required(),
}).required()

export const resetPasswordSchema = joi
.object({
    email: generalField.email.required(),
    code: generalField.code.required(),
    password: generalField.password.required(),
    confirmPassword: generalField.confirmPassword.required(),
}).required()