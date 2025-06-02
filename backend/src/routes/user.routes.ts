import { Router } from "express";
import { userController } from "../controllers/users.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import * as userValidation from "../validations/user.validation";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(userController.getAll)
);
router.get("/:id", asyncHandler(userController.getById));
router.put(
  "/:id",
  validate(userValidation.updateUserSchema),
  asyncHandler(userController.update)
);
router.delete(
  "/:id",
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(userController.delete)
);

export default router;
