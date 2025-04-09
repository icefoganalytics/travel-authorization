import yukonGovernmentIntegration, {
  type YukonGovernmentDivision,
} from "@/integrations/yukon-government-integration"

import { YgEmployeeGroup } from "@/models"
import { SyncService } from "@/services/yg-employee-groups"

import { loadTestData } from "@/support"

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
    })
  })
})
