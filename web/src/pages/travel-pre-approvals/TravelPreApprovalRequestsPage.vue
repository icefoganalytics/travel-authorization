<template>
  <TravelAuthorizationPreApprovalsDataTable ref="travelAuthorizationPreApprovalsDataTable">
    <template #top="{ items, selectedItems }">
      <v-row>
        <v-col class="d-flex flex-column flex-md-row align-center">
          <!-- TODO: make all of these buttons full width on small screens -->
          <v-spacer />
          <TravelAuthorizationPreApprovalSubmissionDialog
            :disabled="isEmpty(selectedItems)"
            :travel-requests="items"
            :selected-requests="selectedItems"
            :submission-id="0"
            button-name="Submit Selected Travel"
            @updateTable="refresh"
          />
          <PrintReport
            :disabled="isEmpty(selectedItems)"
            :travel-requests="selectedItems"
            button-name="Print Report"
          />
          <v-btn
            :disabled="isEmpty(selectedItems)"
            class="mr-5 my-7"
            color="primary"
            @click="exportToExcel(selectedItems)"
          >
            Export To Excel
          </v-btn>
          <v-btn
            color="primary"
            :to="{
              name: 'travel-pre-approvals/TravelPreApprovalNewPage',
            }"
          >
            Add Travel Pre-Approval
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </TravelAuthorizationPreApprovalsDataTable>
</template>

<script setup>
import { ref } from "vue"
import { isEmpty } from "lodash"
import { ExportToCsv } from "export-to-csv"
import { DateTime } from "luxon"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import TravelAuthorizationPreApprovalSubmissionDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalSubmissionDialog.vue"

import TravelAuthorizationPreApprovalsDataTable from "@/components/trave-authorization-pre-approvals/TravelAuthorizationPreApprovalsDataTable.vue"

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsDataTable> | null>} */
const travelAuthorizationPreApprovalsDataTable = ref(null)

function refresh() {
  travelAuthorizationPreApprovalsDataTable.value?.refresh()
}

function exportToExcel(travelAuthorizationPreApprovals) {
  // The object keys must match the headers option.
  // In future versions of the library, the headers can be customized independently.
  const csvInfo = travelAuthorizationPreApprovals.map((req) => {
    return {
      Name: req.profiles?.map((profile) => profile.profileName.replace(".", " "))?.join(", "),
      Department: req.department,
      Branch: req.branch ? req.branch : "",
      "Travel Date": req.isOpenForAnyDate ? req.month : req.startDate + " " + req.endDate,
      Location: req.location,
      Purpose: req.purpose ? req.purpose : "",
      "Estimated Cost": req.estimatedCost,
      Reason: req.reason ? req.reason : "",
      Status: req.status ? req.status : "",
      Notes: req.travelerNotes ? req.travelerNotes : "",
    }
  })
  const currentDate = DateTime.now().toFormat("yyyy-MM-dd")
  const options = {
    filename: `Travel Requests, Pre-Approved, ${currentDate}`,
    decimalSeparator: "locale",
    showLabels: true,
    headers: [
      "Name",
      "Department",
      "Branch",
      "Travel Date",
      "Location",
      "Purpose",
      "Estimated Cost",
      "Reason",
      "Status",
      "Notes",
    ],
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
  {
    text: "Requests",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
