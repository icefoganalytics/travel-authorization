import http from "http"

const startDelaySeconds = Number(process.env.START_DELAY_SECONDS) || 20
const failThroughAfterSeconds = Number(process.env.FAILTHROUGH_AFTER_SECONDS) || 180
const intervalMilliseconds = 2000
const apiStatusUrl = "http://api:3000/_status"

console.log("Checking if API is already up...")
http
  .get(apiStatusUrl, (response) => {
    if (response.statusCode === 200) {
      console.log("API is ready (immediate check)")
      process.exit(0)
    }

    startNormalCheck()
  })
  .on("error", () => {
    startNormalCheck()
  })

function startNormalCheck() {
  setTimeout(() => {
    console.log("Waiting for API service...")
    const startTime = Date.now()

    const checkApi = () => {
      http
        .get(apiStatusUrl, (response) => {
          if (response.statusCode === 200) {
            console.log("API is ready")
            process.exit(0)
          }

          retry()
        })
        .on("error", retry)
    }

    const retry = () => {
      const elapsedSeconds = (Date.now() - startTime) / 1000

      if (elapsedSeconds >= failThroughAfterSeconds) {
        console.log(`API is ready (fail-through after ${failThroughAfterSeconds}s)`)
        process.exit(0)
      }

      console.log(`API is not ready (${Math.floor(elapsedSeconds)}s/${failThroughAfterSeconds}s)`)
      setTimeout(checkApi, intervalMilliseconds)
    }

    checkApi()
  }, startDelaySeconds * 1000)
}
