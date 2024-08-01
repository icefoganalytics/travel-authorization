import { createToken, Lexer, CstParser } from "chevrotain"

const Flights = createToken({ name: "Flights", pattern: /Flights:/ })
const Departure = createToken({ name: "Departure", pattern: /Departure:/ })
const Arrival = createToken({ name: "Arrival", pattern: /Arrival:/ })
const Duration = createToken({ name: "Duration", pattern: /\d+ Hour\(s\) \d+ Minutes/ })
const Status = createToken({ name: "Status", pattern: /Status: [a-zA-Z]+/ })
const Class = createToken({ name: "Class", pattern: /Class: [a-zA-Z]/ })
const Terminal = createToken({ name: "Terminal", pattern: /Terminal:/ })
const FlightNumber = createToken({ name: "FlightNumber", pattern: /[A-Z]{2}\d{1,4}/ })
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]+/ })
const OperatedBy = createToken({ name: "OperatedBy", pattern: /- Operated By:/ })
const Date = createToken({ name: "Date", pattern: /\d{2} \w{3}/ })
const Time = createToken({ name: "Time", pattern: /\d{2}:\d{2}/ })
const AirportCode = createToken({ name: "AirportCode", pattern: /[A-Z]{3}/ })
const TerminalCode = createToken({ name: "TerminalCode", pattern: /[a-zA-Z0-9]+/ })
const OpenParen = createToken({ name: "OpenParen", pattern: /\(/ })
const CloseParen = createToken({ name: "CloseParen", pattern: /\)/ })
const Newline = createToken({ name: "Newline", pattern: /\n/ })
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/ })

const allTokens = [
  Newline,
  WhiteSpace,
  Flights,
  Departure,
  Arrival,
  Duration,
  Status,
  Class,
  Terminal,
  FlightNumber,
  Identifier,
  OperatedBy,
  Date,
  Time,
  AirportCode,
  TerminalCode,
  OpenParen,
  CloseParen,
]

export const TravelLexer = new Lexer(allTokens)

/**
 * See web/src/utils/travel/travel-grammar.g4
 */
export class TravelParser extends CstParser {
  constructor() {
    super(allTokens)

    const $ = this

    $.RULE("main", () => {
      $.SUBRULE($.flightsSection)
    })

    $.RULE("flightsSection", () => {
      $.CONSUME(Flights)
      $.CONSUME(Newline)
      $.MANY(() => {
        $.SUBRULE($.flightDetails)
      })
    })

    $.RULE("flightDetails", () => {
      $.SUBRULE($.airlineClause)
      $.SUBRULE($.departureClause)
      $.SUBRULE($.arrivalClause)
      $.SUBRULE($.durationClause)
      $.SUBRULE($.statusClause)
      $.SUBRULE($.classClause)
    })

    $.RULE("airlineClause", () => {
      $.OPTION(() => {
        $.CONSUME(WhiteSpace)
      })
      $.AT_LEAST_ONE(() => {
        $.CONSUME(Identifier)
        $.CONSUME1(WhiteSpace)
      })
      $.CONSUME(FlightNumber)
      $.OPTION1(() => {
        $.SUBRULE($.operatedByClause)
      })
      $.CONSUME(Newline)
    })

    $.RULE("operatedByClause", () => {
      $.CONSUME(OperatedBy)
      $.CONSUME(Identifier)
    })

    $.RULE("departureClause", () => {
      $.OPTION(() => {
        $.CONSUME(WhiteSpace)
      })
      $.CONSUME(Departure)
      $.CONSUME(Date)
      $.CONSUME(Time)
      $.CONSUME(Identifier)
      $.CONSUME(OpenParen)
      $.CONSUME(AirportCode)
      $.CONSUME(CloseParen)
      $.CONSUME(Terminal)
      $.OPTION1(() => {
        $.CONSUME(TerminalCode)
      })
    })

    $.RULE("arrivalClause", () => {
      $.CONSUME(Arrival)
      $.CONSUME(Date)
      $.CONSUME(Time)
      $.CONSUME(Identifier)
      $.CONSUME(AirportCode)
      $.CONSUME(Terminal)
      $.OPTION(() => {
        $.CONSUME(TerminalCode)
      })
    })

    $.RULE("durationClause", () => {
      $.CONSUME(Duration)
    })

    $.RULE("statusClause", () => {
      $.CONSUME(Status)
    })

    $.RULE("classClause", () => {
      $.CONSUME(Class)
    })

    this.performSelfAnalysis()
  }
}

export default TravelParser
