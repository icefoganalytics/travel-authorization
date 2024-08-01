flightsSection
   : "Flights:" flightDetails+

flightDetails
   : airlineClause departureClause arrivalClause durationClause statusClause classClause

airlineClause
   : Name FlightNumber (operatedByClause)?

operatedByClause
   : "- Operated By:" Name

departureClause
   : "Departure:" Date Time Name "(" AirportCode ")" "Terminal:" TerminalCode?

arrivalClause
   : "Arrival:" Date Time Name "(" AirportCode ")" "Terminal:" TerminalCode?

durationClause
   : "Duration:" Duration

statusClause
   : "Status:" Status

classClause
   : "Class:" Class

// Atomic expressions
Name
   : [a-zA-Z ]+

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
