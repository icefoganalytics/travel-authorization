<template>
  <v-card>
    <v-card-title>
      <h3>Invoice</h3>
    </v-card-title>
    <v-skeleton-loader
      v-if="isLoading"
      type="card"
    />
    <v-card-text
      v-else
      class="d-flex justify-space-between align-center"
    >
      <span class="primary--text body-1">
        Invoice Number: {{ travelDeskTravelRequest.invoiceNumber }}
      </span>
      <v-btn
        color="secondary"
        :loading="isLoading"
        @click="downloadPdf"
      >
        Download PNR
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs } from "vue"

import { TRAVEL_DESK_URL } from "@/urls"
import http from "@/api/http-client"

import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: [Number, String],
    required: true,
  },
})

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest, isLoading } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const snack = useSnack()

// TODO: update this to use standardized API endpoint once available
// e.g. /api/travel-desk-travel-requests/{travelDeskTravelRequestId}/passenger-name-record/download
// can also just have button click navigate to that endpoint, as modern browsers will automatically
// open a file response in a new tab. Instead of the whole link click stuff below.
async function downloadPdf() {
  isLoading.value = true
  try {
    const { data } = await http.get(
      `${TRAVEL_DESK_URL}/pnr-document/${props.travelDeskTravelRequestId}`,
      {
        responseType: "application/pdf",
        headers: {
          "Content-Type": "application/text",
        },
      }
    )

    const link = document.createElement("a")
    link.href = data
    document.body.appendChild(link)
    link.download = "pnr_doc.pdf"
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.log(error)
    snack.error(`Failed to download PNR: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
