import URLToPathName from "@/utils/url-to-path-name"

describe("web/src/utils/url-to-path-name.ts", () => {
  describe("URLToPathName", () => {
    describe("when given an absolute URL", () => {
      test.each([
        {
          input: "http://localhost:3000/api/path",
          output: "/api/path",
        },
        {
          input: "https://example.com/api/downloads/expenses/17/receipt",
          output: "/api/downloads/expenses/17/receipt",
        },
        {
          input: "http://example.com/",
          output: "/",
        },
        {
          input: "http://example.com",
          output: "/",
        },
        {
          input: "https://api.gov.yk.ca/heritage/api/users",
          output: "/heritage/api/users",
        },
        {
          input: "http://localhost:3000/api/traveldesk/travel-requests/123",
          output: "/api/traveldesk/travel-requests/123",
        },
      ])("when input is $input, returns $output", ({ input, output }) => {
        const result = URLToPathName(input)
        expect(result).toEqual(output)
      })
    })

    describe("when given a relative URL", () => {
      test.each([
        {
          input: "/api/path",
          output: "/api/path",
        },
        {
          input: "/api/downloads/expenses/17/receipt",
          output: "/api/downloads/expenses/17/receipt",
        },
        {
          input: "/api",
          output: "/api",
        },
        {
          input: "/",
          output: "/",
        },
        {
          input: "api/path",
          output: "api/path",
        },
      ])("when input is $input, returns $output", ({ input, output }) => {
        const result = URLToPathName(input)
        expect(result).toEqual(output)
      })
    })

    describe("when given undefined", () => {
      test("returns undefined", () => {
        const result = URLToPathName(undefined)
        expect(result).toBeUndefined()
      })
    })

    describe("when given an invalid URL", () => {
      test.each([
        {
          input: "invalid-url",
          output: "invalid-url",
        },
        {
          input: "not a url",
          output: "not a url",
        },
        {
          input: "",
          output: "",
        },
      ])("when input is $input, returns $output", ({ input, output }) => {
        const result = URLToPathName(input)
        expect(result).toEqual(output)
      })
    })

    describe("when given URLs with query parameters and hashes", () => {
      test.each([
        {
          input: "http://localhost:3000/api/path?query=param",
          output: "/api/path",
        },
        {
          input: "https://example.com/api/downloads/expenses/17/receipt#section",
          output: "/api/downloads/expenses/17/receipt",
        },
        {
          input: "http://example.com/api/path?query=param#hash",
          output: "/api/path",
        },
      ])("when input is $input, returns $output", ({ input, output }) => {
        const result = URLToPathName(input)
        expect(result).toEqual(output)
      })
    })
  })
})
