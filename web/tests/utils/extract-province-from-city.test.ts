import extractProvinceFromCity from "@/utils/extract-province-from-city"

describe("web/src/utils/extract-province-from-city.ts", () => {
  describe("extractProvinceFromCity", () => {
    test("when the city ends with a province suffix, returns the province", () => {
      // Arrange
      const city = "Whitehorse (YT)"

      // Act
      const province = extractProvinceFromCity(city)

      // Assert
      expect(province).toBe("YT")
    })

    test("when the city name contains parentheses, returns the final province suffix", () => {
      // Arrange
      const city = "Niagara (Old Town) (ON)"

      // Act
      const province = extractProvinceFromCity(city)

      // Assert
      expect(province).toBe("ON")
    })

    test("when the city has no province suffix, returns undefined", () => {
      // Arrange
      const city = "Whitehorse"

      // Act
      const province = extractProvinceFromCity(city)

      // Assert
      expect(province).toBeUndefined()
    })

    test("when text follows the parentheses, returns undefined", () => {
      // Arrange
      const city = "Whitehorse (YT) office"

      // Act
      const province = extractProvinceFromCity(city)

      // Assert
      expect(province).toBeUndefined()
    })

    test("when the province suffix is empty, returns undefined", () => {
      // Arrange
      const city = "Whitehorse ()"

      // Act
      const province = extractProvinceFromCity(city)

      // Assert
      expect(province).toBeUndefined()
    })
  })
})
