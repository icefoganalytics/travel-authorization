import { CronJob } from "cron"

import { logger } from "@/utils/logger"
import { YgEmployees, YgEmployeeGroups } from "@/services"

logger.debug(`Scheduler started in app container.`)

/**
 * See https://www.npmjs.com/package/cron.
 *
 * Most useful debugging option is `runOnInit: true`, which will immediately executes the job.
 *
 * Allowed fields
 * # ┌────────────── second (optional)
 * # │ ┌──────────── minute
 * # │ │ ┌────────── hour
 * # │ │ │ ┌──────── day of month
 * # │ │ │ │ ┌────── month
 * # │ │ │ │ │ ┌──── day of week
 * # │ │ │ │ │ │
 * # │ │ │ │ │ │
 * # * * * * * *
 */

CronJob.from({
  cronTime: "0 0 6 * * *",
  async onTick() {
    await YgEmployees.SyncService.perform()
  },
  start: true,
  timeZone: "UTC-7",
})

CronJob.from({
  cronTime: "0 10 6 * * *",
  async onTick() {
    await YgEmployeeGroups.SyncService.perform()
  },
  start: true,
  timeZone: "UTC-7",
})
