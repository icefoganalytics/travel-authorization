export function parseTravel(text) {
  console.log("PARSE")
  const cleanText =
    /^(?:Passenger:\s*\n(?<passengers>(?:\s*.*\n)*))^(?:Flights:\s*\n(?<flights>(?:\s*.*\n)*))^(?:Hotels:\s*\n(?<hotels>(?:\s*.*\n)*))^(?:Cars:\s*\n(?<cars>(?:\s*.*)*))/gm

  const passengersRegex = /(?<passengerNumber>\d+)\. (?<passengerName>.+) - (?<passengerType>.+)/gm
  const flightsRegex =
    /(?<airline>[a-zA-Z ]+) (?<flightNumber>[a-zA-Z0-9]+)[ \t]*\nDeparture:[ \t]*(?<departureDate>[0-9]+ [a-zA-Z]+) (?<departureTime>[0-9:]+) +(?<departureAirport>[a-zA-Z ]+) \((?<departureAirportCode>[A-Z]+)\) +Terminal:[ \t]*(?<departureTerminal>[a-zA-Z]*?)[ \t]*\nArrival:[ \t]*(?<arrivalDate>[0-9]+ [a-zA-Z]+) (?<arrivalTime>[0-9:]+) +(?<arrivalAirport>[a-zA-Z ]+) \((?<arrivalAirportCode>[A-Z]+)\) +Terminal:[ \t]*(?<arrivalTerminal>[a-zA-Z]*?)[ \t]*\nDuration:[ \t]*(?<duration>[0-9]+ Hour\(s\)[ ]*[0-9]+ Minutes)[ \t]*\nStatus:[ \t]*(?<status>.*)[ \t]*\nClass:[ \t]*(?<class>[a-zA-Z]+)/gm

  const hotelRegex =
    /(?<hotelName>.+), (?<city>.+), (?<country>.+)\nCheckin Date:[ \t]*(?<checkinDate>[0-9]+ [a-zA-Z]+)\nCheckout Date:[ \t]*(?<checkoutDate>[0-9]+ [a-zA-Z]+)\n.*\n.*\nRate Code:[ \t]*(?<rateCode>.+)\nStatus:[ \t]*(?<status>.*)\nPrice:[ \t]*(?<currency>[A-Z]{3}) - (?<currencyName>.+) (?<cost>\d+\.\d{2})/gm

  const carRegex =
    /Confirmation Number: (?<confirmationNumber>.+)[\t]*\nPickup Time: (?<pickupTime>.+)[\t]*\nLocation: (?<location>.+)\nVendor: (?<vendor>.+)[\t]*\nDrop Off Time: (?<dropoffTime>.+)[\t]*\nCar Type: (?<carType>.+)[\t]*\nApproximate Cost: (?<currency>[A-Z]{3}) (?<cost>\d+\.\d{2})/gm

  let passengers = []
  let flights = []
  let hotels = []
  let cars = []
  let parseObject = {}

  let sections = cleanText.exec(text)

  if (sections?.groups) {
    // console.log("Groups: ", sections?.groups);

    if (sections?.groups.passengers) {
      // console.log("Passengers raw: ", sections?.groups.passengers);
      let match
      while ((match = passengersRegex.exec(sections?.groups.passengers)) !== null) {
        passengers.push({
          passengerNumber: match.groups?.passengerNumber || "",
          passengerName: match.groups?.passengerName || "",
          passengerType: match.groups?.passengerType || "",
        })
      }
      // console.log("Passengers: ", passengers);
      parseObject.passengers = passengers
    }

    if (sections?.groups.flights) {
      //console.log("Flights raw: ", sections?.groups.flights);
      let match
      while ((match = flightsRegex.exec(sections?.groups.flights)) !== null) {
        flights.push({
          airline: match.groups?.airline || "",
          flightNumber: match.groups?.flightNumber || "",
          departureDate: match.groups?.departureDate || "",
          departureTime: match.groups?.departureTime || "",
          departureAirport: match.groups?.departureAirport || "",
          departureAirportCode: match.groups?.departureAirportCode || "",
          arrivalDate: match.groups?.arrivalDate || "",
          arrivalTime: match.groups?.arrivalTime || "",
          arrivalAirport: match.groups?.arrivalAirport || "",
          arrivalAirportCode: match.groups?.arrivalAirportCode || "",
          terminal: match.groups?.terminal || "",
          duration: match.groups?.duration || "",
          status: match.groups?.status || "",
          class: match.groups?.class || "",
        })
      }
      //   console.log("Flights: ", flights);
      parseObject.flights = flights
    }

    if (sections?.groups.hotels) {
      // console.log("Hotels raw: ", sections?.groups.hotels);
      let match
      while ((match = hotelRegex.exec(sections?.groups.hotels)) !== null) {
        hotels.push({
          hotelName: match.groups?.hotelName || "",
          city: match.groups?.city || "",
          country: match.groups?.country || "",
          checkinDate: match.groups?.checkinDate || "",
          checkoutDate: match.groups?.checkoutDate || "",
          rateCode: match.groups?.rateCode || "",
          status: match.groups?.status || "",
          currency: match.groups?.currency || "",
          cost: match.groups?.cost || "",
        })
      }
      //   console.log("Hotels: ", hotels);
      parseObject.hotels = hotels
    }

    if (sections?.groups.cars) {
      // console.log("Cars raw: ", sections?.groups.cars);
      let match
      while ((match = carRegex.exec(sections?.groups.cars)) !== null) {
        cars.push({
          confirmationNumber: match.groups?.confirmationNumber || "",
          pickupTime: match.groups?.pickupTime || "",
          location: match.groups?.location || "",
          vendor: match.groups?.vendor || "",
          dropoffTime: match.groups?.dropoffTime || "",
          carType: match.groups?.carType || "",
          currency: match.groups?.currency || "",
          cost: match.groups?.cost || "",
        })
      }
      //   console.log("Cars: ", cars);
      parseObject.cars = cars
    }
    return parseObject
  }
  return null
}
