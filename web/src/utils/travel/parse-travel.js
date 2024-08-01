import { tokenMatcher } from "chevrotain"

import { TravelLexer, TravelParser } from "@/utils/travel/travel-parser"

const parser = new TravelParser()

export function parseTravel(text) {
  const lexingResult = TravelLexer.tokenize(text)
  parser.input = lexingResult.tokens

  const cst = parser.main()

  if (parser.errors.length > 0) {
    console.error(parser.errors)
    throw new Error("Parsing errors detected!")
  }

  const result = {
    passengers: [],
    flights: [],
    hotels: [],
    cars: [],
  }

  cst.children.section.forEach((section) => {
    if (tokenMatcher(section.children[0], Passenger)) {
      result.passengers.push(
        section.children.Text.map((t) => t.image)
          .join(" ")
          .trim()
      )
    } else if (tokenMatcher(section.children[0], Flights)) {
      result.flights.push(
        section.children.Text.map((t) => t.image)
          .join(" ")
          .trim()
      )
    } else if (tokenMatcher(section.children[0], Hotels)) {
      result.hotels.push(
        section.children.Text.map((t) => t.image)
          .join(" ")
          .trim()
      )
    } else if (tokenMatcher(section.children[0], Cars)) {
      result.cars.push(
        section.children.Text.map((t) => t.image)
          .join(" ")
          .trim()
      )
    }
  })

  return result
}

export default parseTravel
