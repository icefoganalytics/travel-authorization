import { TravelOrderEvent } from "@/integrations/travel-port-integration/models"
import { TravelPortIntegration } from "@/factories"

describe("TravelOrderEvent native datetime persistence", () => {
  test("when factory dates contain an offset, it persists their UTC components and nullable dates", async () => {
    // Arrange
    const timestamp = new Date("2030-01-01T05:00:00.120-07:00")

    // Act
    const event = await TravelPortIntegration.travelOrderEventFactory.create({
      databaseTimestamp: timestamp,
      hostEventTimestamp: timestamp,
      pnrCreationDate: timestamp,
      pnrPurgeDate: null,
    })
    const persistedEvent = await TravelOrderEvent.findByPk(event.travelOrderIdentifier)

    // Assert
    expect(persistedEvent).toMatchObject({
      databaseTimestamp: new Date("2030-01-01T12:00:00.120Z"),
      hostEventTimestamp: new Date("2030-01-01T12:00:00.120Z"),
      pnrCreationDate: new Date("2030-01-01T12:00:00.120Z"),
      pnrPurgeDate: null,
    })
  })

  test("when a native save contains sub-datetime precision, SQL Server rounds the stored value", async () => {
    // Arrange
    const timestamp = new Date("2030-01-01T12:00:00.001Z")

    // Act
    const event = await TravelOrderEvent.create({
      travelOrderIdentifier: 990001,
      databaseTimestamp: timestamp,
      pnrPurgeDate: timestamp,
    })
    await event.reload()

    // Assert
    expect(event).toMatchObject({
      databaseTimestamp: new Date("2030-01-01T12:00:00.000Z"),
      pnrPurgeDate: new Date("2030-01-01T12:00:00.000Z"),
    })
  })
})
