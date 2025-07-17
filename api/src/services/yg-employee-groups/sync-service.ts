import { type CreationAttributes } from "@sequelize/core"

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
        const employeeGroupSet: Set<string> = new Set()
        for (const employeeGroup of employeeGroups) {
          const { department, division, branch, unit } = employeeGroup
          const cleanDepartment = department?.trim()
          const cleanDivision = division?.trim()
          const cleanBranch = branch?.trim()
          const cleanUnit = unit?.trim()

          const employeeGroupKey = [cleanDepartment, cleanDivision, cleanBranch, cleanUnit]
            .filter(Boolean)
            .join("-")
          if (employeeGroupSet.has(employeeGroupKey)) {
            logger.debug(
              `Skipping duplicate YG employee group: ${employeeGroupKey} -> ${JSON.stringify(employeeGroup)}`
            )
            continue
          }

          employeeGroupSet.add(employeeGroupKey)
          ygEmployeeGroupsAttributes.push({
            department: cleanDepartment,
            division: cleanDivision,
            branch: cleanBranch,
            unit: cleanUnit,
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
