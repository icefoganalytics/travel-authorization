type LegacyStop = {
  travelfrom: unknown
  travelto: unknown
  departuretime: unknown
  departuredate: unknown
  transport: unknown
  estimate: unknown
}

type LegacyForm = Record<string, unknown> & {
  stops: LegacyStop[]
}

export function dbToForm(dbForm: LegacyForm) {
  const webForm = {
    firstName: dbForm.firstname,
    lastName: dbForm.lastname,
    department: dbForm.department,
    division: dbForm.division,
    branch: dbForm.branch,
    unit: dbForm.unit,
    email: dbForm.email,
    mailcode: dbForm.mailcode,
    totalTripLength: dbForm.travelduration,
    daysNotTravelling: dbForm.daysnottravel,
    travelAdvance: dbForm.traveladvance,
    purpose: dbForm.purpose,
    eventName: dbForm.eventName,
    summary: dbForm.summary,
    supervisorEmail: dbForm.supervisoremail,
    status: dbForm.status,
    stops: [{}],
  }
  for (const stop of dbForm.stops) {
    webForm.stops.push({
      travelFrom: stop.travelfrom,
      travelTo: stop.travelto,
      departureTime: stop.departuretime,
      departureDate: stop.departuredate,
      transport: stop.transport,
      estimate: stop.estimate,
    })
  }
  return webForm
}

export function formToDb(webForm: LegacyForm) {
  const dbForm = {
    general: {},
    stops: [{}],
  }
  dbForm.general = {
    firstname: webForm.firstName,
    lastname: webForm.lastName,
    department: webForm.department,
    division: webForm.division,
    branch: webForm.branch,
    unit: webForm.unit,
    email: webForm.email,
    mailcode: webForm.mailcode,
    travelduration: webForm.totalTripLength,
    daysnottravel: webForm.daysNotTravelling,
    datebacktowork: webForm.backToWorkDate,
    purpose: webForm.purpose,
    traveladvance: webForm.travelAdvance,
    eventname: webForm.eventName,
    summary: webForm.summary,
    supervisoremail: webForm.supervisorEmail,
    status: webForm.status,
  }
  for (const stop of webForm.stops) {
    dbForm.stops.push({
      travelFrom: stop.travelfrom,
      travelTo: stop.travelto,
      departureTime: stop.departuretime,
      departureDate: stop.departuredate,
      transport: stop.transport,
      estimate: stop.estimate,
    })
  }
  return dbForm
}
