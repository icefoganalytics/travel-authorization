import express, { Request, Response } from "express"
import knex from "knex"
import axios from "axios"

import { RequiresAuth, ReturnValidationErrors } from "@/middleware"
import { DB_CONFIG, AZURE_KEY } from "@/config"
import logger from "@/utils/logger"
import { YgEmployee } from "@/models"
import { YgEmployees } from "@/services"

export const lookupRouter = express.Router()
const db = knex(DB_CONFIG)

/**
 * @deprecated - Prefer /api/yg-employees?filters['search']=<email> -> api/src/controllers/yg-employees-controller.ts#index -> YgEmployee "search" scope
 */
lookupRouter.get(
  "/emailList",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    logger.warn(
      "DEPRECATED: Prefer using /api/yg-employees?filters['search']=<email> -> api/src/controllers/yg-employees-controller.ts#index -> YgEmployee 'search' scope"
    )
    try {
      let emailList = await axios
        .get(`https://api.gov.yk.ca/directory/employees?email=` + req.query.email, {
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_KEY,
          },
        })
        .then((resp: any) => {
          let list = []
          for (let employee of resp.data.employees) {
            if (employee.email != "") list.push(employee.email)
          }
          return list.sort()
        })
      res.status(200).json(emailList)
    } catch (error: any) {
      logger.info(error)
      res.status(400).json("Failed to find user.")
    }
  }
)

/**
 * @deprecated - Prefer /api/yg-employee-groups/:ygEmployeeGroupId -> api/src/controllers/yg-employee-groups-controller.ts#show
 */
lookupRouter.get(
  "/department/:id",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    logger.warn(
      "DEPRECATED: Prefer using /api/yg-employee-groups/:ygEmployeeGroupId -> api/src/controllers/yg-employee-groups-controller.ts#show"
    )
    try {
      let result = await db("departments")
        .select("id", "name", "type", "ownedby")
        .where("ownedby", "=", req.params.id)
        .andWhere("type", "=", "branch")
      res.status(200).json(result)
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupRouter.get("/roles", ReturnValidationErrors, async function (req: Request, res: Response) {
  try {
    let result = await db("roles").select("name")
    res.status(200).json(result)
  } catch (error: any) {
    logger.info(error)
    res.status(500).json("Internal Server Error")
  }
})

lookupRouter.get(
  "/transportMethod",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      let result = await db("transportMethod").select("id", "method")
      res.status(200).json(result)
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

/**
 * @deprecated - Prefer using /yg-employees -> api/src/controllers/yg-employees-controller.ts#index instead
 */
lookupRouter.get(
  "/employees",
  RequiresAuth,
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    logger.warn(
      "DEPRECATED: Prefer using /yg-employees -> api/src/controllers/yg-employees-controller.ts#index instead"
    )
    const cleanList: any[] = []
    try {
      let employees = await YgEmployee.findAll()
      const updateRequired = timeToUpdate(employees[0])

      if (!employees[0] || updateRequired) {
        await YgEmployees.SyncService.perform()
        employees = await YgEmployee.findAll()
      }

      for (const employee of employees) {
        cleanList.push({
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          fullName: employee.fullName,
          email: employee.email,
        })
      }
      res.status(200).json(cleanList)
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

/**
 * @deprecated - Prefer using /yg-employees/:ygEmployeeId -> api/src/controllers/yg-employees-controller.ts#show instead
 */
lookupRouter.get("/employee-info", async function (req: Request, res: Response) {
  logger.warn(
    "DEPRECATED: Prefer using /yg-employees/:ygEmployeeId -> api/src/controllers/yg-employees-controller.ts#show instead"
  )
  try {
    let employees = await YgEmployee.findAll({
      where: {
        email: req.query.email as string | string[],
      },
    })
    const updateRequired = timeToUpdate(employees[0])

    if (!employees[0] || updateRequired) {
      await YgEmployees.SyncService.perform()
      employees = await YgEmployee.findAll({
        where: {
          email: req.query.email as string | string[],
        },
      })
    }

    let employeeInfo = {}
    if (employees[0]) {
      const employee = employees[0]
      employeeInfo = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        fullName: employee.fullName,
        email: employee.email,
        businessPhone: employee.phoneOffice,
        mobile: employee.mobile,
        office: employee.office,
        address: employee.address,
        community: employee.community,
        postalCode: employee.postalCode,
      }
    }

    res.status(200).json(employeeInfo)
  } catch (error: any) {
    logger.info(error)
    res.status(500).json("Internal Server Error")
  }
})

function timeToUpdate(item: any) {
  const updateTime = new Date()
  //updateTime.setMinutes(updateTime.getMinutes()-1); //Update Time is 24 hours after last update
  updateTime.setDate(updateTime.getDate() - 1) //Update Time is 24 hours after last update
  const lastUpdate = item?.update_date ? new Date(item.update_date) : new Date("2000-01-01")
  return updateTime > lastUpdate
}
