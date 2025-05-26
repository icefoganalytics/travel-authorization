import { ClaimTypes } from "@/models/per-diem"
import { anytime } from "@/factories/helpers"

import determineClaimsPerDay, {
  firstDayClaimTypes,
  middleDayClaimTypes,
  lastDayClaimTypes,
  isSameDay,
} from "@/services/expenses/build-attributes-from-travel-segments-helpers/determine-claims-per-day"

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
describe("api/src/services/expenses/build-attributes-from-travel-segments-helpers/determine-claims-per-day.ts", () => {
  describe(".determineClaimsPerDay", () => {
    test("example case of 3 day trip", () => {
      const travelStartAt = new Date("2022-06-05")
      const travelEndAt = new Date("2022-06-07 15:00")

      expect(determineClaimsPerDay(travelStartAt, travelEndAt)).toEqual([
        {
          date: new Date("2022-06-05"),
          claims: [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.DINNER],
        },
        {
          date: new Date("2022-06-06"),
          claims: [
            ClaimTypes.BREAKFAST,
            ClaimTypes.LUNCH,
            ClaimTypes.DINNER,
            ClaimTypes.INCIDENTALS,
          ],
        },
        {
          date: new Date("2022-06-07 15:00"),
          claims: [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.INCIDENTALS],
        },
      ])
    })

    test.each([
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-01"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
        ],
      },
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-01 23:59"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
        ],
      },
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-02"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
          {
            date: new Date("2021-01-02"),
            claims: lastDayClaimTypes(0),
          },
        ],
      },
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-02 23:59"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
          {
            date: new Date("2021-01-02 23:59"),
            claims: lastDayClaimTypes(23),
          },
        ],
      },
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-03"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
          {
            date: new Date("2021-01-02"),
            claims: middleDayClaimTypes(),
          },
          {
            date: new Date("2021-01-03"),
            claims: lastDayClaimTypes(0),
          },
        ],
      },
      {
        travelStartAt: new Date("2021-01-01"),
        travelEndAt: new Date("2021-01-04"),
        expected: [
          {
            date: new Date("2021-01-01"),
            claims: firstDayClaimTypes(0),
          },
          {
            date: new Date("2021-01-02"),
            claims: middleDayClaimTypes(),
          },
          {
            date: new Date("2021-01-03"),
            claims: middleDayClaimTypes(),
          },
          {
            date: new Date("2021-01-04"),
            claims: lastDayClaimTypes(0),
          },
        ],
      },
    ])(
      "determineClaimsPerDay($travelStartAt, $travelEndAt)",
      ({ travelStartAt, travelEndAt, expected }) => {
        expect(determineClaimsPerDay(travelStartAt, travelEndAt)).toEqual(expected)
      }
    )

    test("when given a random start time, maps to start hour", () => {
      const startTime = anytime()
      const travelStartAt = new Date(`2021-01-01 ${startTime}`)
      const travelEndAt = new Date("2021-01-01 23:59")

      expect(determineClaimsPerDay(travelStartAt, travelEndAt)).toEqual([
        {
          date: travelStartAt,
          claims: firstDayClaimTypes(travelStartAt.getHours()),
        },
      ])
    })

    test("when multi-day with a random end time, maps to end hour", () => {
      const endTime = anytime()
      const travelStartAt = new Date("2021-01-01")
      const travelEndAt = new Date(`2021-01-02 ${endTime}`)

      expect(determineClaimsPerDay(travelStartAt, travelEndAt)).toEqual([
        {
          date: new Date("2021-01-01"),
          claims: firstDayClaimTypes(0),
        },
        {
          date: travelEndAt,
          claims: lastDayClaimTypes(travelEndAt.getHours()),
        },
      ])
    })
  })

  describe(".firstDayClaimTypes", () => {
    describe("on the first day of travel", () => {
      test.each([
        {
          startHour: 7,
          expected: [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.DINNER],
        },
        {
          startHour: 8,
          expected: [ClaimTypes.LUNCH, ClaimTypes.DINNER],
        },
        {
          startHour: 12,
          expected: [ClaimTypes.LUNCH, ClaimTypes.DINNER],
        },
        {
          startHour: 13,
          expected: [ClaimTypes.DINNER],
        },
        {
          startHour: 18,
          expected: [ClaimTypes.DINNER],
        },
        {
          startHour: 19,
          expected: [],
        },
      ])("firstDayClaimTypes($startHour)", ({ startHour, expected }) => {
        expect(firstDayClaimTypes(startHour)).toEqual(expected)
      })
    })
  })

  describe(".middleDayClaimTypes", () => {
    describe("on the second and subsequent days of travel", () => {
      test("returns the full per diem including incidentals", () => {
        expect(middleDayClaimTypes()).toEqual([
          ClaimTypes.BREAKFAST,
          ClaimTypes.LUNCH,
          ClaimTypes.DINNER,
          ClaimTypes.INCIDENTALS,
        ])
      })
    })
  })

  describe(".lastDayClaimTypes", () => {
    describe("on the last day of travel", () => {
      test.each([
        {
          endHour: 9,
          expected: [ClaimTypes.INCIDENTALS],
        },
        {
          endHour: 10,
          expected: [ClaimTypes.BREAKFAST, ClaimTypes.INCIDENTALS],
        },
        {
          endHour: 13,
          expected: [ClaimTypes.BREAKFAST, ClaimTypes.INCIDENTALS],
        },
        {
          endHour: 14,
          expected: [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.INCIDENTALS],
        },
        {
          endHour: 18,
          expected: [ClaimTypes.BREAKFAST, ClaimTypes.LUNCH, ClaimTypes.INCIDENTALS],
        },
        {
          endHour: 19,
          expected: [
            ClaimTypes.BREAKFAST,
            ClaimTypes.LUNCH,
            ClaimTypes.DINNER,
            ClaimTypes.INCIDENTALS,
          ],
        },
      ])("lastDayClaimTypes($endHour)", ({ endHour, expected }) => {
        expect(lastDayClaimTypes(endHour)).toEqual(expected)
      })
    })

    describe(".isSameDay", () => {
      test.each([
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2021-01-01"),
          expected: true,
        },
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2021-01-01 00:00:00"),
          expected: true,
        },
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2021-01-01 23:59:59"),
          expected: true,
        },
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2021-01-02"),
          expected: false,
        },
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2021-02-01"),
          expected: false,
        },
        {
          date1: new Date("2021-01-01"),
          date2: new Date("2022-01-01"),
          expected: false,
        },
      ])("isSameDay($date1, $date2)", ({ date1, date2, expected }) => {
        expect(isSameDay(date1, date2)).toEqual(expected)
      })
    })
  })
})
