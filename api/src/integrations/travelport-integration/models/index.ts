import db from "@/integrations/travelport-integration/db/db-client"

import AirReservationSegment from "./air-reservation-segment"
import Passenger from "./passenger"
import ServiceFeeTransaction from "./service-fee-transaction"
import TravelOrderEvent from "./travel-order-event"

db.addModels([TravelOrderEvent, Passenger, AirReservationSegment, ServiceFeeTransaction])

export { AirReservationSegment, Passenger, ServiceFeeTransaction, TravelOrderEvent }
export default db
