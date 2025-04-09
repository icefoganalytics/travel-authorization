import axios from "axios"
import { isEmpty, pick } from "lodash"

import { NODE_ENV, AZURE_KEY } from "@/config"

// Use optimized direct URL for production, and the slow open API Gateway URL for development.
const baseURL =
  NODE_ENV === "production" ? "https://directory-api-prd.ynet.gov.yk.ca" : "https://api.gov.yk.ca"

const yukonGovernmentApi = axios.create({
  baseURL,
  headers: {
    "Ocp-Apim-Subscription-Key": AZURE_KEY,
  },
})

// Its possible that any field might be null, but I haven't been able to verify this.
export type YukonGovernmentEmployee = {
  full_name: string //  "John.Doe"
  first_name: string //  "John"
  last_name: string //  "Doe"
  organization: string | null //  null
  department: string //  "Example Department"
  division: string | null //  "Example Division"
  branch: string | null //  "Example Branch"
  unit: string | null //  "Example Unit"
  title: string //  "Example Title"
  email: string //  "john.doe@example.com"
  suite: string //  ""
  phone_office: string //  "123-456-7890"
  fax_office: string //  ""
  mobile: string //  "987-654-3210"
  office: string //  "Example Office Location"
  address: string //  "1234 Example Street"
  po_box: string //  "100"
  community: string //  "Example City"
  postal_code: string //  "X0X 0X0"
  latitude: number | null //  null
  longitude: number | null //  null
  mailcode: string //  "XYZ"
  manager: string //  "Jane.Manager"
  username: string //  "jdoe"
}

export type YukonGovernmentDivision = {
  department: string // "Cabinet Office",
  division: string | null // null,
  branch: string | null // null,
  unit: string | null // null,
  order: number // 100
}

export const yukonGovernmentIntegration = {
  // I haven't been able identify the params required for pagination
  async fetchEmployees(params: { email?: string } = {}): Promise<{
    employees: YukonGovernmentEmployee[]
    count: number
  }> {
    const { data } = await yukonGovernmentApi.get("/directory/employees", {
      params,
      timeout: 10000, // Without pagination, response can be very slow.
    })
    return data
  },

  async fetchEmployee(email: string): Promise<YukonGovernmentEmployee | null> {
    const { employees } = await yukonGovernmentIntegration.fetchEmployees({ email })

    if (isEmpty(employees)) {
      return null
    }

    if (employees.length > 1) {
      let errorMessage = `Found more than one employee info at https://api.gov.yk.ca/directory/employees?email=${email}`
      const emails = pick(employees, "email")
      errorMessage = errorMessage.concat(`\nemails found: ${JSON.stringify(emails)}`)
      throw new Error(errorMessage)
    }

    return employees[0]
  },

  async fetchDepartments(): Promise<{
    departments: string[]
    count: number
  }> {
    const { data } = await yukonGovernmentApi.get("/directory/departments")
    return data
  },

  // I haven't been able identify the params required for pagination
  async fetchDivisions(): Promise<{
    divisions: YukonGovernmentDivision[]
    count: number
  }> {
    const { data } = await yukonGovernmentApi.get("/directory/divisions", {
      timeout: 5000, // Without pagination, response can be very slow.
    })
    return data
  },
}

export default yukonGovernmentIntegration
