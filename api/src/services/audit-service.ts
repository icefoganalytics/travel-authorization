import dbLegacy from "@/db/db-migration-client"
import logger from "@/utils/logger"

export class AuditService {
  async log(
    userId: number,
    taid: number | undefined,
    action: string,
    note?: string
  ): Promise<boolean | undefined> {
    try {
      const timestamp = new Date()
      await dbLegacy("auditHistory").insert({
        userId,
        taid,
        action,
        note,
        timestamp,
      })

      return true
    } catch (error: unknown) {
      logger.info(error)
    }
  }
}
