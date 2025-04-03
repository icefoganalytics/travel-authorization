<template>
  <TravelAuthorizationPreApprovalsDataTable
    ref="travelAuthorizationPreApprovalsDataTable"
    v-model="selectedItems"
    :show-select="canAdminTravelPreApprovals"
  >
    <template #top>
      <v-row>
        <v-col class="d-flex flex-column flex-md-row align-center">
          <!-- TODO: make all of these buttons full width on small screens -->
          <v-spacer />
          <v-btn
            v-if="canAdminTravelPreApprovals"
            color="primary"
            :disabled="isEmpty(selectedItemIds)"
            @click="showTravelAuthorizationPreApprovalSubmissionDialog"
          >
            Submit Selected Requests
            <TravelAuthorizationPreApprovalSubmissionDialog
              ref="travelAuthorizationPreApprovalSubmissionDialog"
              @submitted="refresh"
            />
          </v-btn>

          <v-btn
            v-if="canAdminTravelPreApprovals"
            class="ml-md-5"
            color="primary"
            outlined
            @click="showTravelAuthorizationPreApprovalsPrintDialog"
          >
            Print Report
            <TravelAuthorizationPreApprovalsPrintDialog
              ref="travelAuthorizationPreApprovalsPrintDialog"
            />
          </v-btn>
          <v-btn
            v-if="canAdminTravelPreApprovals"
            :disabled="isEmpty(selectedItems)"
            class="ml-md-5"
            color="primary"
            @click="exportToExcel(selectedItems)"
          >
            Export To Excel
          </v-btn>
          <v-btn
            class="ml-md-5"
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
import { computed, ref } from "vue"
import { isEmpty } from "lodash"
import { ExportToCsv } from "export-to-csv"
import { DateTime } from "luxon"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import TravelAuthorizationPreApprovalsDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsDataTable.vue"
import TravelAuthorizationPreApprovalsPrintDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsPrintDialog.vue"
import TravelAuthorizationPreApprovalSubmissionDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalSubmissionDialog.vue"

const selectedItems = ref([])

const selectedItemIds = computed(() => {
  return selectedItems.value.map((item) => item.id)
})

const { isAdmin, isPreApprovedTravelAdmin } = useCurrentUser()
const canAdminTravelPreApprovals = computed(() => isAdmin.value || isPreApprovedTravelAdmin.value)

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalSubmissionDialog> | null>} */
const travelAuthorizationPreApprovalSubmissionDialog = ref(null)

function showTravelAuthorizationPreApprovalSubmissionDialog() {
  travelAuthorizationPreApprovalSubmissionDialog.value?.show(selectedItemIds.value)
}

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsPrintDialog> | null>} */
const travelAuthorizationPreApprovalsPrintDialog = ref(null)

function showTravelAuthorizationPreApprovalsPrintDialog() {
  travelAuthorizationPreApprovalsPrintDialog.value?.show()
}

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsDataTable> | null>} */
const travelAuthorizationPreApprovalsDataTable = ref(null)

function refresh() {
  selectedItems.value = []
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
