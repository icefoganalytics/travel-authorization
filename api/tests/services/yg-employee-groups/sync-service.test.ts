import yukonGovernmentIntegration, {
  type YukonGovernmentDivision,
} from "@/integrations/yukon-government-integration"

import { YgEmployeeGroup } from "@/models"
import { SyncService } from "@/services/yg-employee-groups"

import { loadTestData, testWithCustomLogLevel } from "@/support"

vi.mock("@/integrations/yukon-government-integration", () => {
  const yukonGovernmentIntegrationMock = {
    fetchDivisions: vi.fn(),
  }

  return {
    yukonGovernmentIntegration: yukonGovernmentIntegrationMock,
    default: yukonGovernmentIntegrationMock,
  }
})

const yukonGovernmentIntegrationMock = vi.mocked(yukonGovernmentIntegration)

describe("api/src/services/yg-employee-groups/sync-service.ts", () => {
  describe("SyncService", () => {
    describe(".perform", () => {
      test("when yukon government integration returns employee groups, it inserts the expected number into the database", async () => {
        // Arrange
        const apiResponse = loadTestData(
          "yukon-government-api-directory-divisions-response-2025-04-09.json"
        ) as {
          divisions: YukonGovernmentDivision[]
          count: number
        }
        yukonGovernmentIntegrationMock.fetchDivisions.mockResolvedValue(apiResponse)

        // Act
        await SyncService.perform()

        // Assert
        const ygEmployeeGroupCount = await YgEmployeeGroup.count()
        expect(ygEmployeeGroupCount).toBe(709)
      })

      test("when yukon government integration returns employee groups, it creates the expected number of departments", async () => {
        // Arrange
        const apiResponse = loadTestData(
          "yukon-government-api-directory-divisions-response-2025-04-09.json"
        ) as {
          divisions: YukonGovernmentDivision[]
          count: number
        }
        yukonGovernmentIntegrationMock.fetchDivisions.mockResolvedValue(apiResponse)

        // Act
        await SyncService.perform()

        // Assert
        const departmentCount = await YgEmployeeGroup.scope("isDepartment").count()
        expect(departmentCount).toBe(26)
      })

      test("when yukon government integration returns employee groups, it creates the expected number of divisions", async () => {
        // Arrange
        const apiResponse = loadTestData(
          "yukon-government-api-directory-divisions-response-2025-04-09.json"
        ) as {
          divisions: YukonGovernmentDivision[]
          count: number
        }
        yukonGovernmentIntegrationMock.fetchDivisions.mockResolvedValue(apiResponse)

        // Act
        await SyncService.perform()

        // Assert
        const divisionCount = await YgEmployeeGroup.scope("isDivision").count()
        expect(divisionCount).toBe(102)
      })

      test("when yukon government integration returns employee groups, it creates the expected number of branches", async () => {
        // Arrange
        const apiResponse = loadTestData(
          "yukon-government-api-directory-divisions-response-2025-04-09.json"
        ) as {
          divisions: YukonGovernmentDivision[]
          count: number
        }
        yukonGovernmentIntegrationMock.fetchDivisions.mockResolvedValue(apiResponse)

        // Act
        await SyncService.perform()

        // Assert
        const branchCount = await YgEmployeeGroup.scope("isBranch").count()
        expect(branchCount).toBe(264)
      })

      test("when yukon government integration returns employee groups, it creates the expected number of units", async () => {
        // Arrange
        const apiResponse = loadTestData(
          "yukon-government-api-directory-divisions-response-2025-04-09.json"
        ) as {
          divisions: YukonGovernmentDivision[]
          count: number
        }
        yukonGovernmentIntegrationMock.fetchDivisions.mockResolvedValue(apiResponse)

        // Act
        await SyncService.perform()

        // Assert
        const unitCount = await YgEmployeeGroup.scope("isUnit").count()
        expect(unitCount).toBe(317)
      })

      testWithCustomLogLevel(
        "when yukon government integration errors, catches the error",
        async ({ setLogLevel }) => {
          // Arrange
          setLogLevel("silent")

          yukonGovernmentIntegrationMock.fetchDivisions.mockRejectedValue(
            new Error("Yukon government integration error")
          )

          // Assert
          await expect(
            // Act
            SyncService.perform()
          ).resolves.toBeUndefined()
        }
      )
    })
  })
})
