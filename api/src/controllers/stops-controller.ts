import { WhereOptions } from "@sequelize/core"

import BaseController from "./base-controller"

import { Stop } from "@/models"

export class StopsController extends BaseController {
  index() {
    const where = this.query.where as WhereOptions<Location>
    return Stop.findAll({
      where,
      order: [
        ["departureDate", "ASC"],
        ["departureTime", "ASC"],
      ],
    }).then((stops) => {
      return this.response.json({ stops })
    })
  }
}

export default StopsController
