<template>
  <v-btn
    v-bind="$attrs"
    :loading="isLoading"
    v-on="$listeners"
    @click="exportToCsv"
  >
    <template #default>
      <slot> Export To CSV </slot>
    </template>
  </v-btn>
</template>

<script setup>
import { computed } from "vue"
import { ExportToCsv } from "export-to-csv"
import { isNil, isEmpty } from "lodash"
import { DateTime } from "luxon"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import useTravelDeskTravelRequests, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/use/use-travel-desk-travel-requests"

const props = defineProps({
  travelDeskTravelRequestIds: {
    type: Array,
    default: () => [],
  },
})

const { t } = useI18n()

const travelDeskTravelRequestsQuery = computed(() => {
  return {
    where: {
      id: props.travelDeskTravelRequestIds,
    },
  }
})
const { travelDeskTravelRequests, isLoading } = useTravelDeskTravelRequests(
  travelDeskTravelRequestsQuery,
  {
    skipWatchIf: () =>
      isNil(props.travelDeskTravelRequestIds) || isEmpty(props.travelDeskTravelRequestIds),
  }
)

// TODO: move to back-end see https://github.com/icefoganalytics/internal-data-portal/blob/main/api/src/controllers/download/datasets-controller.ts
async function exportToCsv() {
  const csvInfo = travelDeskTravelRequests.value.map((travelDeskTravelRequest) => {
    const {
      createdAt,
      userDisplayName,
      department,
      branch,
      travelStartDate,
      travelEndDate,
      locationsTraveled,
      requestedOptions,
      status,
      travelDeskOfficer,
    } = travelDeskTravelRequest

    const submissionDate = createdAt.slice(0, 10)

    const formattedStatus = determineStatus(status, travelDeskOfficer)
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
}

function determineStatus(status, travelDeskOfficer) {
  if (
    status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.SUBMITTED &&
    (isNil(travelDeskOfficer) || isEmpty(travelDeskOfficer))
  ) {
    return "Not Started"
  }

  return t(`travel_desk_travel_request.status.${status}`, {
    $default: status,
  })
}
</script>
