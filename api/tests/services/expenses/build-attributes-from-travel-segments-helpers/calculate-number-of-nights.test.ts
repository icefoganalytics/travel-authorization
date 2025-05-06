import { calculateNumberOfNights } from "@/services/expenses/build-attributes-from-travel-segments-helpers"

describe("api/src/services/expenses/build-attributes-from-travel-segments-helpers/calculate-number-of-nights.ts", () => {
  describe(".calculateNumberOfNights", () => {
    test.each([
      {
        arrivalAt: new Date("2022-06-05 00:00:00"),
        departureAt: new Date("2022-06-07 12:00:00"),
        expected: 2,
      },
      {
        arrivalAt: new Date("2022-06-05 23:00:00"),
        departureAt: new Date("2022-06-07 07:00:00"),
        expected: 2,
      },
    ])(
      "calculateNumberOfNights($arrivalAt, $departureAt)",
      ({ arrivalAt, departureAt, expected }) => {
        expect(calculateNumberOfNights(arrivalAt, departureAt)).toBe(expected)
      }
    )
  })

  test("when arrivalAt is after departureAt, errors informatively", () => {
    expect(() => {
      calculateNumberOfNights(
        new Date("2022-06-07 12:00:00"),
        new Date("2022-06-05 00:00:00")
      )
    }).toThrow("arrivalAt must be less than or equal to departureAt")
  })
})
