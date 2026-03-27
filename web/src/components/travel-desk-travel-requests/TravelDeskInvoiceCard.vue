<template>
  <v-card>
    <v-card-title>
      <h3>Invoice</h3>
    </v-card-title>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <v-card-text
      v-else
      class="d-flex justify-space-between align-center"
    >
      <strong> Invoice Number: {{ travelDeskTravelRequest.invoiceNumber }} </strong>
      <DownloadFileForm
        :download-url="downloadUrl"
        color="secondary"
        text="Download PNR"
        :loading="isLoading"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { passengerNameRecordDocumentsApi } from "@/api/downloads/travel-desk-travel-requests/passenger-name-record-documents-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest, isLoading } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const downloadUrl = computed(() =>
  passengerNameRecordDocumentsApi.downloadPath(travelDeskTravelRequestId.value)
)
</script>
