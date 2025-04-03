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
import { DateTime } from "luxon"
import { isNil, isEmpty } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"

import { formatCurrency } from "@/utils/formatters"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

const travelAuthorizationPreApprovalsQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE, // TODO: support passing filter options so we aren't printing all pre-approvals each time.
  }
})
const { travelAuthorizationPreApprovals, isLoading } = useTravelAuthorizationPreApprovals(
  travelAuthorizationPreApprovalsQuery
)

// TODO: switch to back-end rendering at a dedicated endpoint via
// fast-csv, see https://github.com/icefoganalytics/internal-data-portal/blob/0eb01fff60c6b5d72b060f89e92cf15336225531/api/src/controllers/download/datasets-controller.ts#L28
async function exportToCsv() {
  const csvInfo = travelAuthorizationPreApprovals.value.map((travelAuthorizationPreApproval) => {
    const {
      profiles,
      department,
      branch,
      isOpenForAnyDate,
      month,
      startDate,
      endDate,
      location,
      purpose,
      estimatedCost,
      reason,
      status,
      travelerNotes,
    } = travelAuthorizationPreApproval

    const formattedName = formatName(profiles)
    const formattedDepartment = department ?? ""
    const formattedBranch = branch ?? ""
    const travelDate = formatTravelDate(isOpenForAnyDate, startDate, endDate, month)
    const formattedLocation = location ?? ""
    const formattedPurpose = purpose ?? ""
    const formattedEstimatedCost = formatCurrency(estimatedCost)
    const formattedReason = reason ?? ""
    const formattedStatus = status ?? ""
    const formattedNotes = travelerNotes ?? ""

    return {
      ["Name"]: formattedName,
      ["Department"]: formattedDepartment,
      ["Branch"]: formattedBranch,
      ["Travel Date"]: travelDate,
      ["Location"]: formattedLocation,
      ["Purpose"]: formattedPurpose,
      ["Estimated Cost"]: formattedEstimatedCost,
      ["Reason"]: formattedReason,
      ["Status"]: formattedStatus,
      ["Notes"]: formattedNotes,
    }
  })

  const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    title: "",
    // TODO: use better, or new library to get _ (underscores) out of file name
    filename: `Export, Travel Pre-Approval Requests, ${timestamp}`,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}

function formatName(travelAuthorizationPreApprovalProfiles) {
  if (
    isNil(travelAuthorizationPreApprovalProfiles) ||
    isEmpty(travelAuthorizationPreApprovalProfiles)
  ) {
    return ""
  }

  return travelAuthorizationPreApprovalProfiles
    .map((profile) => profile.profileName.replace(".", " "))
    .join(", ")
}

function formatTravelDate(isOpenForAnyDate, startDate, endDate, month) {
  if (isOpenForAnyDate) {
    return month ?? ""
  }

  return [startDate, endDate].filter(Boolean).join(" to ") ?? ""
}
</script>
