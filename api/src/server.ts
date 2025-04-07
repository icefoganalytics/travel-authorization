import { API_PORT } from "@/config"
import logger from "@/utils/logger"

import app from "@/app"
import "@/scheduler" // TODO: Instead of importing run in separate container

app.listen(API_PORT, async () => {
  logger.info(`API listenting on port ${API_PORT}`)
})
