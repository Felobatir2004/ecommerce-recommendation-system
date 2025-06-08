import {Router} from "express"
import * as authService from "./auth.service.js"
import * as authValidation from "./auth.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";

const router = Router()

router.post(
    "/register",
    validation(authValidation.registerSchema),
    asyncHandler(authService.register)
)

router.patch(
    "/verifyEmail",
    validation(authValidation.confirmEmailSchema),
    asyncHandler(authService.verifyEmail)
)
router.post(
    "/login",
    validation(authValidation.signInSchema),
    asyncHandler(authService.login)
)

// routes/auth.routes.js
router.post(
  "/auth0-login",
  asyncHandler(authService.auth0Login)
)

router.patch(
    "/forget_password",
    validation(authValidation.forgetPasswordSchema),
    asyncHandler(authService.forget_password)
)

router.patch(
    "/reset_password",
    validation(authValidation.resetPasswordSchema),
    asyncHandler(authService.reset_password)
)

export default router