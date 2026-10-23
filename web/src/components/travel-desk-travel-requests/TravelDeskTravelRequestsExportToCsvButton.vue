<template>
  <v-btn
    v-bind="$attrs"
    :loading="isLoading"
    :disabled="isLoading || props.travelDeskTravelRequestIds.length === 0"
    @click="exportToCsv"
  >
    <template #default>
      <slot> Export To CSV </slot>
    </template>
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { ExportToCsv } from "export-to-csv"
import { DateTime } from "luxon"

import formatTravelDeskTravelRequestStatus from "@/utils/format-travel-desk-travel-request-status"

import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

import useSnack from "@/use/use-snack"

const props = defineProps<{
  travelDeskTravelRequestIds: number[]
}>()

const { t } = useI18n()
const snack = useSnack()
const isLoading = ref(false)

async function exportToCsv() {
  if (props.travelDeskTravelRequestIds.length === 0 || isLoading.value) {
    return
  }

  isLoading.value = true
  try {
    const travelDeskTravelRequests = await travelDeskTravelRequestsApi.listSelected(
      props.travelDeskTravelRequestIds
    )

    const csvInfo = travelDeskTravelRequests.map((travelDeskTravelRequest) => {
      const {
        createdAt,
        userDisplayName,
        department,
        branch,
        travelStartDate,
        travelEndDate,
        locationsTraveled,
        requestedOptions,
        travelDeskOfficer,
      } = travelDeskTravelRequest

      const submissionDate = createdAt.slice(0, 10)
      const formattedStatus = formatTravelDeskTravelRequestStatus(travelDeskTravelRequest, t)
      const formattedTravelDeskOfficer = travelDeskOfficer ?? ""

      return {
        ["Submit Date"]: submissionDate,
        ["Name"]: userDisplayName,
        ["Department"]: department,
        ["Branch"]: branch,
        ["Travel Start Date"]: travelStartDate,
        ["Travel End Date"]: travelEndDate,
        ["Location"]: locationsTraveled,
        ["Requested"]: requestedOptions,
        ["Status"]: formattedStatus,
        ["Travel Desk Officer"]: formattedTravelDeskOfficer,
      }
    })

    const timestamp = DateTime.now().toFormat("yyyy-LL-dd")

    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: false,
      title: "",
      // TODO: use better, or new library to get _ (underscores) out of file name
      filename: `Export, Travel Desk Requests, ${timestamp}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    }
    const csvExporter = new ExportToCsv(options)
    csvExporter.generateCsv(csvInfo)
  } catch (error) {
    console.error(error)
    snack.error(`Failed to export travel desk travel requests: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
