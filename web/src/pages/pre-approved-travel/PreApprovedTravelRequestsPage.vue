<template>
  <v-data-table
    v-model="selectedRequests"
    :headers="headers"
    :items="travelAuthorizationPreApprovalsWithRestrictedSelectability"
    :items-per-page="5"
    :loading="isLoading"
    :server-items-length="totalCount"
    @item-selected="applySameDeptSelection"
    @toggle-select-all="applyAllSameDeptSelection"
  >
    <template #top>
      <v-row>
        <v-col class="d-flex flex-column flex-md-row align-center">
          <!-- TODO: make all of these buttons full width on small screens -->
          <v-spacer />
          <SubmitTravel
            :disabled="selectedRequests.length == 0"
            :travel-requests="travelAuthorizationPreApprovals"
            :selected-requests="selectedRequests"
            :submission-id="0"
            button-name="Submit Selected Travel"
            @updateTable="refresh"
          />
          <PrintReport
            :disabled="selectedRequests.length == 0"
            :travel-requests="selectedRequests"
            button-name="Print Report"
          />
          <v-btn
            :disabled="selectedRequests.length == 0"
            class="mr-5 my-7"
            color="primary"
            @click="exportToExcel"
          >
            Export To Excel
          </v-btn>
          <new-travel-request
            type="Add New"
            @updateTable="refresh"
          />
        </v-col>
      </v-row>
    </template>
    <template #item.name="{ item }">
      <template v-if="item.profiles.length === 0"> Unspecified </template>
      <template v-else-if="item.profiles.length === 1">
        {{ item.profiles[0].profileName.replace(".", " ") }}
      </template>
      <v-tooltip
        v-else
        top
        color="primary"
      >
        <template #activator="{ on }">
          <div v-on="on">
            <span>
              {{ item.profiles[0].profileName.replace(".", " ") }}
            </span>
            <span>, ... </span>
          </div>
        </template>
        <span
          ><div
            v-for="(profile, index) in item.profiles"
            :key="index"
          >
            {{ profile.profileName.replace(".", " ") }}
          </div></span
        >
      </v-tooltip>
    </template>

    <template #item.travelDate="{ item }">
      <div v-if="item.isOpenForAnyDate">
        {{ item.month }}
      </div>
      <div v-else>
        <div>
          {{ formatDate(item.startDate) }}
          to
        </div>
        <div>
          {{ formatDate(item.endDate) }}
        </div>
      </div>
    </template>

    <template #item.actions="{ item }">
      <NewTravelRequest
        :type="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT ? 'Edit' : 'View'"
        :travel-request="item"
        @updateTable="refresh"
      />
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, nextTick, ref } from "vue"
import { ExportToCsv } from "export-to-csv"
import { DateTime } from "luxon"

import { formatDate } from "@/utils/formatters"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"
import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"

const headers = ref([
  {
    text: "Name",
    value: "name",
  },
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Travel Date",
    value: "travelDate",
  },
  {
    text: "Location",
    value: "location",
  },
  {
    text: "Purpose Type",
    value: "purpose",
  },
  {
    text: "Reason",
    value: "reason",
  },
  {
    text: "Status",
    value: "status",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
])

const {
  travelAuthorizationPreApprovals,
  isLoading,
  totalCount,
  refresh: refreshPreApprovals,
} = useTravelAuthorizationPreApprovals()

const travelAuthorizationPreApprovalsWithRestrictedSelectability = computed(() => {
  return travelAuthorizationPreApprovals.value.map((travelAuthorizationPreApproval) => {
    const isSelectable =
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED &&
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED &&
      travelAuthorizationPreApproval.department === firstSelectionDept.value

    return {
      ...travelAuthorizationPreApproval,
      isSelectable,
    }
  })
})

const selectedRequests = ref([])
const firstSelectionDept = ref("")

async function refresh() {
  await refreshPreApprovals()
}

async function applySameDeptSelection(selection) {
  await nextTick()

  if (selectedRequests.value.length == 1) {
    firstSelectionDept.value = selectedRequests.value[0].department
  } else if (selectedRequests.value.length === 0) {
    firstSelectionDept.value = ""
  }

  if (selection.value == true && selection.item.department != firstSelectionDept.value) {
    selectedRequests.value = selectedRequests.value.filter((req) => req.id != selection.item.id)
  }
}

async function applyAllSameDeptSelection(selection) {
  await nextTick()
  if (selection.value == true && firstSelectionDept.value) {
    selectedRequests.value = selectedRequests.value.filter(
      (req) => req.department == firstSelectionDept.value
    )
  } else {
    selectedRequests.value = []
    firstSelectionDept.value = ""
  }
}

function exportToExcel() {
  // The object keys must match the headers option.
  // In future versions of the library, the headers can be customized independently.
  const csvInfo = selectedRequests.value.map((req) => {
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
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
