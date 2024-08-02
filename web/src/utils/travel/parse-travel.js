import { tokenMatcher } from "chevrotain"

import { TravelLexer, TravelParser } from "@/utils/travel/travel-parser"

const parser = new TravelParser()

export function parseTravel(text) {
  const lexingResult = TravelLexer.tokenize(text)
  console.log("lexingResult:", lexingResult)
  console.log("lexingResult:", JSON.stringify(lexingResult, null, 2))
  parser.input = lexingResult.tokens

  const cst = parser.main()

  if (parser.errors.length > 0) {
    console.error(parser.errors)
    throw new Error("Parsing errors detected!")
  }

  const result = {
    flights: [],
  }

  console.log("cst:", cst)

  return result
}

export default parseTravel
