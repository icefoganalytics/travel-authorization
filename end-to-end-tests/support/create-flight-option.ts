import { expect, type Page } from "@playwright/test"

import type { FlightOptionAttributes } from "@/end-to-end-tests/factories/flight-option-factory"

type FlightSegmentDraft = {
  flightNumber: string
  class: string
}

async function waitForFlightSegmentDraft(
  page: Page,
  attributes: FlightOptionAttributes
): Promise<void> {
  const requestId = new URL(page.url()).pathname.split("/")[2]
  const storageKey = `travel-desk-travel-request-${requestId}-travel-desk-flight-segments-attributes`

  // Grouping snapshots the debounced draft, not the current input values.
  await page.waitForFunction(
    ({ storageKey, flightNumber, flightClass }) => {
      const draftJson = sessionStorage.getItem(storageKey)
      if (draftJson === null) {
        return false
      }

      const segments = JSON.parse(draftJson) as FlightSegmentDraft[]
      return segments.some(
        (segment) => segment.flightNumber === flightNumber && segment.class === flightClass
      )
    },
    {
      storageKey,
      flightNumber: attributes.flightNumber,
      flightClass: attributes.flightClass,
    }
  )
}

export async function createFlightOption(
  page: Page,
  attributes: FlightOptionAttributes
): Promise<void> {
  await page.getByRole("button", { name: "Add Flight Segment" }).click()
  await page.getByLabel("Flight *", { exact: true }).fill(attributes.flightNumber)
  await page.getByLabel("Duration *", { exact: true }).fill(attributes.duration)
  await page.getByLabel("Depart From *", { exact: true }).fill(attributes.departFrom)
  await page.getByLabel("Departure Date *", { exact: true }).fill(attributes.departureDate)
  await page.getByLabel("Departure Time *", { exact: true }).fill(attributes.departureTime)
  await page.getByLabel("Arrive To *", { exact: true }).fill(attributes.arriveTo)
  await page.getByLabel("Arrival Date *", { exact: true }).fill(attributes.arrivalDate)
  await page.getByLabel("Arrival Time *", { exact: true }).fill(attributes.arrivalTime)
  await page.getByLabel("Status *", { exact: true }).fill(attributes.status)
  await page.getByLabel("Class *", { exact: true }).fill(attributes.flightClass)
  await waitForFlightSegmentDraft(page, attributes)

  await page.getByRole("checkbox", { name: "Select All", exact: true }).check()
  await page.getByRole("button", { name: "Group Selected" }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("Leg *", { exact: true }).press("ArrowDown")
  await page.getByRole("option").nth(attributes.legIndex).click()
  await dialog.getByLabel("Cost *", { exact: true }).fill(attributes.cost)
  await dialog.getByRole("button", { name: "Create Flight Option" }).click()
  await expect(dialog).not.toBeVisible()
}

export default createFlightOption
