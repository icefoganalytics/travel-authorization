import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"

describe("api/src/utils/neutralize-spreadsheet-formula.ts", () => {
  describe("neutralizeSpreadsheetFormula", () => {
    test("when cells contain formula prefixes, neutralizes them while preserving ordinary text", () => {
      // Arrange
      const cells = [
        "=1+1",
        "+1+1",
        "-1+1",
        "@SUM(A1:A2)",
        "  \t=1+1",
        "\r\n=1+1",
        "Équipe, all travellers",
        "",
      ]

      // Act
      const neutralizedCells = cells.map(neutralizeSpreadsheetFormula)

      // Assert
      expect(neutralizedCells).toEqual([
        "'=1+1",
        "'+1+1",
        "'-1+1",
        "'@SUM(A1:A2)",
        "'  \t=1+1",
        "'\r\n=1+1",
        "Équipe, all travellers",
        "",
      ])
    })
  })
})
