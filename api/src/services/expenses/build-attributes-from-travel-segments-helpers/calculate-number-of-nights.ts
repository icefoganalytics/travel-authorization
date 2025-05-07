// This calculates the number of nights you would need to book a hotel for
// as a result the function can't use the time difference alone
export function calculateNumberOfNights(arrivalAt: Date, departureAt: Date): number {
  if (arrivalAt.getTime() > departureAt.getTime()) {
    throw new Error("arrivalAt must be less than or equal to departureAt")
  }

  const arrivalAtStartOfDay = new Date(arrivalAt)
  arrivalAtStartOfDay.setHours(0, 0, 0, 0)
  const departureAtStartOfDay = new Date(departureAt)
  departureAtStartOfDay.setHours(0, 0, 0, 0)

  const differenceInMs = departureAtStartOfDay.getTime() - arrivalAtStartOfDay.getTime()
  const differenceInDaysAsFloat = differenceInMs / (1000 * 3600 * 24)
  const differenceInNights = Math.floor(differenceInDaysAsFloat)

  return differenceInNights
}

export default calculateNumberOfNights
