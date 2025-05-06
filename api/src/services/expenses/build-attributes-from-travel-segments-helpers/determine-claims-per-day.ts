import { ClaimTypes } from "@/models/per-diem"

/*
Requirements:
1. On the first day of travel:
  1. Where travel starts after 8am the traveler will not receive breakfast.
  2. Where travel starts after 1pm the traveler will not receive breakfast or lunch.
  3. Where travel starts after 7pm the traveler will not receive any per diem.
      > these rules are going to be slightly different when we look at air travel as travelers need to be at the airport 2 hours early but for the estimates this will work as we are not clear on exact travel times
  4. No incidentals can be claimed this day.

4. On the second and subsequent days of travel:
  1. The traveler will receive the full per diem including incidentals.

5. On the last day of travel:
  1. Where travel ends at 10am the traveler will receive only breakfast
  2. Where travel ends at 2pm the traveler will receive breakfast and lunch
  3. Where travel ends at 7pm the traveler will receive breakfast, lunch and supper
  4. Incidental can be claimed this day regardless of arrival time.
*/
export type ClaimTypeEntry = {
  date: Date
  claims: ClaimTypes[]
}
export type ClaimTypesPerDay = ClaimTypeEntry[]

export function determineClaimsPerDay(travelStartAt: Date, travelEndAt: Date): ClaimTypesPerDay {
  if (travelStartAt.getTime() > travelEndAt.getTime()) {
    throw new Error("Stayed at date cannot be after departure date")
  }

  const claimTypes: ClaimTypesPerDay = []

  let currentDate = new Date(travelStartAt)
  while (currentDate <= travelEndAt) {
    const isFirstDay = isSameDay(currentDate, travelStartAt)
    const isLastDay = isSameDay(currentDate, travelEndAt)

    let dayClaims: ClaimTypes[]
    if (isFirstDay) {
      const startHour = currentDate.getHours()
      dayClaims = firstDayClaimTypes(startHour)
    } else if (isLastDay) {
      currentDate = new Date(travelEndAt)
      const endHour = currentDate.getHours()
      dayClaims = lastDayClaimTypes(endHour)
    } else {
      dayClaims = middleDayClaimTypes()
    }

    claimTypes.push({ date: new Date(currentDate), claims: dayClaims })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return claimTypes
}

export function firstDayClaimTypes(startHour: number): ClaimTypes[] {
  if (startHour < 8 /* 8am */) {
    return [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.DINNER]
  } else if (startHour < 13 /* 1pm */) {
    return [ClaimTypes.LUNCH, ClaimTypes.DINNER]
  } else if (startHour < 19 /* 7pm */) {
    return [ClaimTypes.DINNER]
  } else {
    return []
  }
}

export function middleDayClaimTypes(): ClaimTypes[] {
  return [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.DINNER, ClaimTypes.INCIDENTALS]
}

export function lastDayClaimTypes(endHour: number): ClaimTypes[] {
  if (endHour < 10 /* 10pm */) {
    return [ClaimTypes.INCIDENTALS]
  } else if (endHour < 14 /* 2pm */) {
    return [ClaimTypes.BREAKFAST, ClaimTypes.INCIDENTALS]
  } else if (endHour < 19 /* 7pm */) {
    return [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.INCIDENTALS]
  } else {
    return [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.DINNER, ClaimTypes.INCIDENTALS]
  }
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export default determineClaimsPerDay
