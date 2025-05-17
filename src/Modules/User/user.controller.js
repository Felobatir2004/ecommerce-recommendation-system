import {Router} from "express"
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import { validation } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
const router = Router()

router.patch(
    "/updateUser",
    authentication(),
    validation(userValidation.updateUserSchema),
    asyncHandler(userService.updateUser)
)

router.get(
    "/getLoginUserData",
    authentication(),
    asyncHandler(userService.getLoginUserData)
)

router.get(
    "/:userId",
    authentication(),
    validation(userValidation.getProfileSchema),
    asyncHandler(userService.getProfile)
)

router.patch(
    "/updatePassword",
    validation(userValidation.updatePasswordSchema),
    authentication(),
    asyncHandler(userService.updatePassword)
)

router.patch(
    "/softDelete/:userId",
    authentication(),
    validation(userValidation.softDeleteSchema),
    asyncHandler(userService.softDelete)
)

export default router