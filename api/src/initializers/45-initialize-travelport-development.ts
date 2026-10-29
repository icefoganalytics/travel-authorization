import { NODE_ENV, TRAVELPORT_INITIALIZER_PATH } from "@/config"
import logger from "@/utils/logger"
import importAndExecuteInitializers from "@/utils/import-and-execute-initializers"

// The Travelport simulator is local/test-only; production uses externally configured source access.
export async function initializeTravelportDevelopment(): Promise<void> {
  if (NODE_ENV === "production") return

  await importAndExecuteInitializers(TRAVELPORT_INITIALIZER_PATH)
}

export default initializeTravelportDevelopment

// Run via `dev ts-node ./src/initializers/45-initialize-travelport-development.ts`
if (require.main === module) {
  ;(async () => {
    try {
      await initializeTravelportDevelopment()
    } catch {
      logger.error("Failed to complete Travelport initialization!")
      process.exitCode = 1
    }
  })()
}
