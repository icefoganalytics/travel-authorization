import axios from "axios"
import { isEmpty, isNil } from "lodash"

import { YUKON_GOVERNMENT_FINANCE_API_KEY } from "@/config"
import parsePossiblyDoubleEncodedJson from "@/utils/parse-possibly-double-encoded-json"

const baseURL = "https://api.gov.yk.ca"

const yukonGovernmentApi = axios.create({
  baseURL,
  headers: {
    "Ocp-Apim-Subscription-Key": YUKON_GOVERNMENT_FINANCE_API_KEY,
  },
  transformResponse: [parsePossiblyDoubleEncodedJson],
})

export type YukonGovernmentFinanceAccount = {
  account: string // 4421010100555000123456
  department: string // ***** EDUCATION
  accountDescription: string // SCHOOL FACILITY UPGRADES
  type: string // Expense
  status: string // Active
  objectDescription: string // Building Maintenance and Repairs
  voteDescription: string // EDUCATION CAPITAL
  programDescription: string // *** FACILITIES MANAGEMENT
  activityDescription: string // ** CLASSROOM MODERNIZATION
  elementDescription: string // * HVAC SYSTEMS
}

export const financeIntegration = {
  api: {
    v1: {
      async fetchAccountInformation(
        generalLedgerCode: string
      ): Promise<YukonGovernmentFinanceAccount | null> {
        const generalLedgerCodeWithoutHyphens = generalLedgerCode.replace(/-/g, "")
        const { data } = await yukonGovernmentApi.get(
          `/finance/api/v1/cs/accounts/${generalLedgerCodeWithoutHyphens}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        )
        if (isNil(data) || isEmpty(data)) return null
        if (data.length > 1) {
          throw new Error(
            `Found more than one account for ${generalLedgerCodeWithoutHyphens} at https://api.gov.yk.ca/finance/api/v1/cs/accounts/${generalLedgerCodeWithoutHyphens}`
          )
        }
        const [account] = data
        return account
      },
    },
  },
}

export default financeIntegration
