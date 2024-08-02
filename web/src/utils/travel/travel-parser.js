import { createToken, Lexer, CstParser, EOF } from "chevrotain"

const Flights = createToken({ name: "Flights", pattern: /Flights:/ })
const Departure = createToken({ name: "Departure", pattern: /Departure:/ })
const Arrival = createToken({ name: "Arrival", pattern: /Arrival:/ })
const Duration = createToken({ name: "Duration", pattern: /Duration:/ })
const Status = createToken({ name: "Status", pattern: /Status:/ })
const Class = createToken({ name: "Class", pattern: /Class:/ })
const Terminal = createToken({ name: "Terminal", pattern: /Terminal:/ })
const FlightNumber = createToken({ name: "FlightNumber", pattern: /[A-Z]{2}\d{1,4}/ })
const AirportCode = createToken({ name: "AirportCode", pattern: /[A-Z]{3}/ })
const DurationValue = createToken({ name: "DurationValue", pattern: /\d+ Hour\(s\) \d+ Minutes/ })
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]+/ })
const OperatedBy = createToken({ name: "OperatedBy", pattern: /- Operated By:/ })
const Date = createToken({ name: "Date", pattern: /\d{2} \w{3}/ })
const Time = createToken({ name: "Time", pattern: /\d{2}:\d{2}/ })
const TerminalCode = createToken({ name: "TerminalCode", pattern: /[A-Za-z0-9\- ]+/ })
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
  AirportCode,
  DurationValue,
  Identifier,
  OperatedBy,
  Date,
  Time,
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
      // $.CONSUME1(EOF)
    })

    $.RULE("flightsSection", () => {
      $.CONSUME(Flights)
      $.CONSUME(Newline)
      $.MANY(() => {
        $.SUBRULE($.flightDetails)
        $.CONSUME1(Newline)
        $.OPTION(() => {
          $.CONSUME2(Newline)
        })
      })
    })

    $.RULE("flightDetails", () => {
      $.OPTION(() => {
        $.CONSUME(WhiteSpace)
      })
      $.SUBRULE($.airlineClause)
      $.CONSUME(Newline)

      $.OPTION1(() => {
        $.CONSUME1(WhiteSpace)
      })
      $.SUBRULE($.departureClause)
      $.CONSUME1(Newline)

      $.OPTION2(() => {
        $.CONSUME2(WhiteSpace)
      })
      $.SUBRULE($.arrivalClause)
      $.CONSUME2(Newline)

      $.OPTION3(() => {
        $.CONSUME3(WhiteSpace)
      })
      $.SUBRULE($.durationClause)
      $.CONSUME3(Newline)

      $.OPTION4(() => {
        $.CONSUME4(WhiteSpace)
      })
      $.SUBRULE($.statusClause)
      $.CONSUME4(Newline)

      $.OPTION5(() => {
        $.CONSUME5(WhiteSpace)
      })
      $.SUBRULE($.classClause)
      $.CONSUME5(Newline)
    })

    $.RULE("airlineClause", () => {
      $.AT_LEAST_ONE(() => {
        $.CONSUME(Identifier)
        $.CONSUME1(WhiteSpace)
      })
      $.CONSUME(FlightNumber)
      $.OPTION1(() => {
        $.SUBRULE($.operatedByClause)
      })
    })

    $.RULE("operatedByClause", () => {
      $.CONSUME(OperatedBy)
      $.CONSUME(Identifier)
    })

    $.RULE("departureClause", () => {
      $.CONSUME(Departure)
      $.CONSUME1(WhiteSpace)
      $.CONSUME(Date)
      $.CONSUME2(WhiteSpace)
      $.CONSUME(Time)
      $.CONSUME3(WhiteSpace)
      $.AT_LEAST_ONE(() => {
        $.CONSUME(Identifier)
        $.CONSUME4(WhiteSpace)
      })
      $.CONSUME(OpenParen)
      $.CONSUME(AirportCode)
      $.CONSUME(CloseParen)
      $.CONSUME5(WhiteSpace)
      $.CONSUME(Terminal)
      $.OPTION1(() => {
        $.CONSUME6(WhiteSpace)
        $.OR([{ ALT: () => $.CONSUME(TerminalCode) }, { ALT: () => $.CONSUME1(Identifier) }])
      })
    })

    $.RULE("arrivalClause", () => {
      $.CONSUME(Arrival)
      $.CONSUME1(WhiteSpace)
      $.CONSUME(Date)
      $.CONSUME2(WhiteSpace)
      $.CONSUME(Time)
      $.CONSUME3(WhiteSpace)
      $.AT_LEAST_ONE(() => {
        $.CONSUME(Identifier)
        $.CONSUME4(WhiteSpace)
      })
      $.CONSUME(OpenParen)
      $.CONSUME(AirportCode)
      $.CONSUME(CloseParen)
      $.CONSUME5(WhiteSpace)
      $.CONSUME(Terminal)
      $.OPTION1(() => {
        $.CONSUME6(WhiteSpace)
        $.OR([{ ALT: () => $.CONSUME(TerminalCode) }, { ALT: () => $.CONSUME1(Identifier) }])
      })
    })

    $.RULE("durationClause", () => {
      $.CONSUME(Duration)
      $.CONSUME1(WhiteSpace)
      $.CONSUME(DurationValue)
    })

    $.RULE("statusClause", () => {
      $.CONSUME(Status)
      $.CONSUME1(WhiteSpace)
      $.CONSUME(Identifier)
    })

    $.RULE("classClause", () => {
      $.CONSUME(Class)
      $.CONSUME1(WhiteSpace)
      $.CONSUME(Identifier)
    })

    this.performSelfAnalysis()
  }
}

export default TravelParser
