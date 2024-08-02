flightsSection
   : "Flights:" flightDetails+

flightDetails
   : airlineClause departureClause arrivalClause durationClause statusClause classClause

airlineClause
   : Identifier FlightNumber (operatedByClause)?

operatedByClause
   : "- Operated By:" Identifier

departureClause
   : "Departure:" Date Time Identifier "(" AirportCode ")" "Terminal:" TerminalCode?

arrivalClause
   : "Arrival:" Date Time Identifier "(" AirportCode ")" "Terminal:" TerminalCode?

durationClause
   : "Duration:" Duration

statusClause
   : "Status:" Status

classClause
   : "Class:" Class

// Atomic expressions
Identifier
   : [a-zA-Z]+

FlightNumber
   : [A-Z]{2}\d{1,4}

Date
   : \d{2} \w{3}

Time
   : \d{2}:\d{2}

AirportCode
   : [A-Z]{3}

TerminalCode
   : [a-zA-Z0-9]*

Duration
   : \d+ "Hour(s)" \d+ "Minutes"

Status
   : [a-zA-Z ]+

Class
   : [a-zA-Z]
