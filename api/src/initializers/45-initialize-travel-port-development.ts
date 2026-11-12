import { NODE_ENV, TRAVELPORT_INITIALIZER_PATH } from "@/config"
import logger from "@/utils/logger"
import importAndExecuteInitializers from "@/utils/import-and-execute-initializers"

// The TravelPort simulator is local/test-only; production uses externally configured source access.
export async function initializeTravelPortDevelopment(): Promise<void> {
  if (NODE_ENV === "production") return

  await importAndExecuteInitializers(TRAVELPORT_INITIALIZER_PATH)
}

export default initializeTravelPortDevelopment

// Run via `dev ts-node ./src/initializers/45-initialize-travel-port-development.ts`
if (require.main === module) {
  ;(async () => {
    try {
      await initializeTravelPortDevelopment()
    } catch {
      logger.error("Failed to complete TravelPort initialization!")
      process.exitCode = 1
    }
  })()
}
