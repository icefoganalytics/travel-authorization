const http = require("node:http")

const financeAccountPath = /^\/finance\/api\/v1\/cs\/accounts\/([^/]+)$/

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(JSON.stringify({ status: "ok" }))
    return
  }

  const match = request.url?.match(financeAccountPath)
  if (request.method !== "GET" || !match) {
    response.writeHead(404)
    response.end()
    return
  }

  response.writeHead(200, { "Content-Type": "application/json" })
  response.end(
    JSON.stringify([
      {
        account: match[1],
        department: "E2E TEST DEPARTMENT",
        accountDescription: "End-to-end test account",
        type: "Expense",
        status: "Active",
        objectDescription: "End-to-end test object",
        voteDescription: "End-to-end test vote",
        programDescription: "End-to-end test program",
        activityDescription: "End-to-end test activity",
        elementDescription: "End-to-end test element",
      },
    ])
  )
})

server.listen(3000)
