import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { validate } from "../middleware/validation"
import { authValidation } from "../validations/auth.validation"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()
const authController = new AuthController()

router.post("/login", validate(authValidation.login), asyncHandler(authController.login))
router.post("/signup", validate(authValidation.signup), asyncHandler(authController.signup))
router.post("/refresh", asyncHandler(authController.refreshToken))
router.post("/logout", asyncHandler(authController.logout))

export default router
