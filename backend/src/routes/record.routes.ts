import { Router } from "express"
import { RecordController } from "../controllers/record.controller"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validation"
import { recordValidation } from "../validations/record.validation"
import { asyncHandler } from "../utils/asyncHandler"

const router = Router()
const recordController = new RecordController()

// All routes require authentication
router.use(authenticate)

router.get("/", asyncHandler(recordController.getAll))
router.get("/unpaid", asyncHandler(recordController.getUnpaidStudents))
router.get("/submitted", asyncHandler(recordController.getSubmittedRecordsByDate))
router.get("/details", asyncHandler(recordController.getRecordDetails))
router.get("/:classId", asyncHandler(recordController.getStudentRecordsByClassAndDate))

router.post(
  "/generate-daily",
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(recordValidation.generateDaily),
  asyncHandler(recordController.generateDailyRecords),
)
router.post("/submit", validate(recordValidation.submit), asyncHandler(recordController.submitRecord))

router.put("/:id", validate(recordValidation.update), asyncHandler(recordController.update))
router.put("/:id/status", validate(recordValidation.updateStatus), asyncHandler(recordController.updateStatus))

router.delete("/:id", authorize("ADMIN", "SUPER_ADMIN"), asyncHandler(recordController.delete))

export default router
