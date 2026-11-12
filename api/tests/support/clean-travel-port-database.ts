import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"

export async function cleanTravelPortDatabase(): Promise<void> {
  await sourceDatabase.transaction(async (transaction) => {
    await transaction("Passenger").del()
    await transaction("AirRsrvSeg").del()
    await transaction("SFTrans").del()
    await transaction("TravelOrderEvent").del()
  })
}

export default cleanTravelPortDatabase
