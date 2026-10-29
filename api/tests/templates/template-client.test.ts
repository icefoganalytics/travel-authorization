import templateClient from "@/templates/template-client"

describe("api/src/templates/template-client.ts", () => {
  describe("TemplateClient", () => {
    describe(".render", () => {
      test("when a report cell contains HTML, it renders it as text instead of an executable element", () => {
        // Arrange
        const logoDataUri = `data:image/svg+xml;base64,${templateClient.loadAsset("assets/yukon.svg")}`
        const pages = [[{ Name: '<img src=x onerror="alert(1)">' }]]

        // Act
        const htmlDocument = templateClient.render("travel-desk-travel-requests/report.html", {
          headers: ["Name"],
          logoDataUri,
          pages,
        })

        // Assert
        const renderedCells = Array.from(htmlDocument.matchAll(/<td>([\s\S]*?)<\/td>/g))
        const renderedValues = renderedCells.map((cell) => cell[1])
        expect(renderedValues).toEqual(["&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"])
      })
    })
  })
})
