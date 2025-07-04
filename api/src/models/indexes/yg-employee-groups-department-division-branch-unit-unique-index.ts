import { Op } from "@sequelize/core"
import { createIndexDecorator } from "@sequelize/core/decorators-legacy"

export const YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex = createIndexDecorator(
  "yg-employee-groups-department-division-branch-unit-unique",
  {
    name: "yg_employee_groups_department_division_branch_unit_unique",
    unique: true,
    where: {
      department: {
        [Op.not]: null,
      },
      division: {
        [Op.not]: null,
      },
      branch: {
        [Op.not]: null,
      },
      unit: {
        [Op.not]: null,
      },
      deletedAt: {
        [Op.is]: null,
      },
    },
  }
)

export default YgEmployeeGroupsDepartmentDivisionBranchUnitUniqueIndex
