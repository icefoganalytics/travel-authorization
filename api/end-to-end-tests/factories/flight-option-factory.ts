import { Factory } from "fishery"

export type FlightOptionAttributes = {
  legIndex: number
  flightNumber: string
  duration: string
  departFrom: string
  departureDate: string
  departureTime: string
  arriveTo: string
  arrivalDate: string
  arrivalTime: string
  status: string
  flightClass: string
  cost: string
}

const flightNumberOffset = 122

export const flightOptionFactory = Factory.define<FlightOptionAttributes>(({ sequence }) => ({
  legIndex: 0,
  flightNumber: `AC ${flightNumberOffset + sequence}`,
  duration: "2h 30m",
  departFrom: "Whitehorse (YT)",
  departureDate: "2026-06-01",
  departureTime: "08:00",
  arriveTo: "Vancouver (BC)",
  arrivalDate: "2026-06-01",
  arrivalTime: "10:30",
  status: "Confirmed",
  flightClass: "Economy",
  cost: "350",
}))

export default flightOptionFactory
