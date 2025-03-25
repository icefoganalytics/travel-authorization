import { type CreationAttributes } from "sequelize"

import logger from "@/utils/logger"
import db, { User, YgEmployee } from "@/models"
import { yukonGovernmentIntegration } from "@/integrations"
import BaseService from "@/services/base-service"

export class SyncService extends BaseService {
  // TODO: Track who ran the sync
  constructor(private currentUser?: User) {
    super()
  }

  async perform(): Promise<void> {
    logger.debug("Started syncing Yukon government employees...")
    const today = new Date()
    try {
      const { employees } = await yukonGovernmentIntegration.fetchEmployees()
      await db.transaction(async () => {
        await db.query(/* sql */ ` TRUNCATE "yg_employees" RESTART IDENTITY CASCADE`)

        const ygEmployeesAttributes: CreationAttributes<YgEmployee>[] = []
        const emailsSet: Set<string> = new Set()
        for (const employee of employees) {
          if (emailsSet.has(employee.email)) {
            logger.debug(
              `Skipping duplicate YG employee: ${employee.email} -> ${JSON.stringify(employee)}`
            )
            continue
          }

          emailsSet.add(employee.email)

          const fullName = employee.full_name?.split(".")?.join(" ")
          const manager = employee.manager?.split(".")?.join(" ")
          ygEmployeesAttributes.push({
            email: employee.email,
            username: employee.email,
            fullName,
            firstName: employee.first_name,
            lastName: employee.last_name,
            department: employee.department,
            division: employee.division,
            branch: employee.branch,
            unit: employee.unit,
            organization: employee.organization,
            title: employee.title,
            suite: employee.suite,
            phoneOffice: employee.phone_office,
            faxOffice: employee.fax_office,
            mobile: employee.mobile,
            office: employee.office,
            address: employee.address,
            poBox: employee.po_box,
            community: employee.community,
            postalCode: employee.postal_code,
            latitude: employee.latitude?.toString(),
            longitude: employee.longitude?.toString(),
            mailcode: employee.mailcode,
            manager,
            lastSyncSuccessAt: today,
          })
        }

        await YgEmployee.bulkCreateBatched(ygEmployeesAttributes)
      })

      logger.debug("Finished syncing Yukon government employees.")
    } catch (error: unknown) {
      await YgEmployee.update(
        { lastSyncFailureAt: today },
        {
          where: {},
        }
      )
      logger.error(`Failed to sync Yukon Government employees: ${error}`)
    }
  }
}

export default SyncService
