import cron from "node-cron"
import { OwingService } from "./owing.service"

const owingService = new OwingService()

export const setupCronJobs = () => {
  // Update owings days past due daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily owings update job")
    try {
      await owingService.updateOwingsDaysPastDue()
      console.log("✅ Daily owings update completed")
    } catch (error) {
      console.error("❌ Daily owings update failed:", error)
    }
  })

  console.log("✅ Cron jobs scheduled")
}
