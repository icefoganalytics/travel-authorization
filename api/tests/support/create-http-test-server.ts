import { once } from "node:events"

import app from "@/app"

// Use a live socket only when a test must observe an unfinished HTTP response.
export async function createHttpTestServer() {
  const server = app.listen(0, "127.0.0.1")
  await once(server, "listening")
  const address = server.address()
  if (address === null || typeof address === "string") {
    server.close()
    throw new Error("Expected an HTTP test server TCP address")
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    async close(): Promise<void> {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    },
  }
}

export default createHttpTestServer
