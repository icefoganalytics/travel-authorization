import { CronJob } from "cron"

import { logger } from "@/utils/logger"
import { YgEmployees } from "@/services"

logger.debug(`Scheduler started in app container.`)

/**
 * See https://www.npmjs.com/package/cron.
 *
 * Most useful debugging option is `runOnInit: true`, which will immediately executes the job.
 */

CronJob.from({
  cronTime: "* 0 6 * * *",
  async onTick() {
    await YgEmployees.SyncService.perform()
  },
  start: true,
  timeZone: "UTC-7",
})
