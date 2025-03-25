import { type CreationAttributes } from "sequelize"

import logger from "@/utils/logger"
import db, { User, YgEmployeeGroup } from "@/models"
import { yukonGovernmentIntegration } from "@/integrations"
import BaseService from "@/services/base-service"

export class SyncService extends BaseService {
  // TODO: Track who ran the sync
  constructor(private currentUser?: User) {
    super()
  }

  async perform(): Promise<void> {
    logger.debug("Started syncing Yukon government employee groups...")
    const today = new Date()
    try {
      const { divisions: employeeGroups } = await yukonGovernmentIntegration.fetchDivisions()
      await db.transaction(async () => {
        await db.query(/* sql */ ` TRUNCATE "yg_employee_groups" RESTART IDENTITY CASCADE`)

        const ygEmployeeGroupsAttributes: CreationAttributes<YgEmployeeGroup>[] = []
        const userGroupSet: Set<string> = new Set()
        for (const employeeGroup of employeeGroups) {
          const { department, division, branch, unit } = employeeGroup
          const userGroupKey = [department, division, branch, unit].filter(Boolean).join("-")
          if (userGroupSet.has(userGroupKey)) {
            logger.debug(
              `Skipping duplicate YG employee group: ${userGroupKey} -> ${JSON.stringify(employeeGroup)}`
            )
            continue
          }

          userGroupSet.add(userGroupKey)
          ygEmployeeGroupsAttributes.push({
            department,
            division,
            branch,
            unit,
            order: employeeGroup.order,
            lastSyncSuccessAt: today,
          })
        }

        await YgEmployeeGroup.bulkCreateBatched(ygEmployeeGroupsAttributes)
      })

      logger.debug("Finished syncing Yukon government employee groups.")
    } catch (error: unknown) {
      await YgEmployeeGroup.update(
        { lastSyncFailureAt: today },
        {
          where: {},
        }
      )
      logger.error(`Failed to sync Yukon Government employee groups: ${error}`)
    }
  }
}

export default SyncService
