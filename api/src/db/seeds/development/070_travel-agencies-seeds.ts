import { isNil } from "lodash"
import { Knex } from "knex"

import { TravelDeskTravelAgency } from "@/models"

export async function seed(_knex: Knex): Promise<void> {
  const travelAgenciesAttributes = [
    {
      agencyName: "Air North",
      contactName: "Reservations Department",
      contactEmail: "reservations@flyairnorth.com",
      contactPhoneNumber: "+1-800-661-0407",
      agencyInfo:
        "Air North, Yukon's Airline, offers flights throughout the Yukon and to the Northwest Territories, British Columbia, Alberta, and seasonally to Ontario.",
    },
    {
      agencyName: "Air Canada",
      contactName: "Customer Support",
      contactEmail: null, // Air Canada primarily uses web forms for customer support
      contactPhoneNumber: "+1-888-247-2262",
      agencyInfo:
        "Air Canada is Canada's largest airline, providing domestic and international flights to over 200 destinations worldwide.",
    },
    {
      agencyName: "WestJet",
      contactName: "Guest Support",
      contactEmail: null, // WestJet primarily uses web forms for customer support
      contactPhoneNumber: "+1-888-937-8538",
      agencyInfo:
        "WestJet is a Canadian airline offering scheduled and charter air service to over 100 destinations in Canada, the United States, Europe, Mexico, Central America, and the Caribbean.",
    },
  ]

  for (const travelAgencyAttributes of travelAgenciesAttributes) {
    const { agencyName } = travelAgencyAttributes

    const travelAgency = await TravelDeskTravelAgency.findOne({
      where: {
        agencyName,
      },
    })

    if (!isNil(travelAgency)) {
      await travelAgency.update(travelAgencyAttributes)
    } else {
      await TravelDeskTravelAgency.create(travelAgencyAttributes)
    }
  }
}
