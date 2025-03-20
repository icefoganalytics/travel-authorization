<template>
  <div class="mx-10 mb-5">
    <v-row class="my-0 mx-0">
      <SubmitTravel
        :disabled="selectedRequests.length == 0"
        :travel-requests="travelAuthorizationPreApprovals"
        :selected-requests="selectedRequests"
        :submission-id="0"
        button-name="Submit Selected Travel"
        class="ml-auto"
        @updateTable="updateTable"
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
        @updateTable="updateTable"
      />
    </v-row>
    <v-data-table
      v-model="selectedRequests"
      :headers="headers"
      :items="travelAuthorizationPreApprovalsWithRestrictedSelectability"
      :items-per-page="5"
      class="elevation-1"
      @item-selected="applySameDeptSelection"
      @toggle-select-all="applyAllSameDeptSelection"
    >
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
            <!-- eslint-disable-next-line vue/no-parsing-error -->
            {{ item.startDate | beautifyDate }}
            to
          </div>
          <div>
            <!-- eslint-disable-next-line vue/no-parsing-error -->
            {{ item.endDate | beautifyDate }}
          </div>
        </div>
      </template>

      <template #item.edit="{ item }">
        <NewTravelRequest
          :type="
            item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT || isNil(item.status)
              ? 'Edit'
              : 'View'
          "
          :travel-request="item"
          @updateTable="updateTable"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue"
import { ExportToCsv } from "export-to-csv"
import { isNil } from "lodash"
import { DateTime } from "luxon"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"
import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"

const emit = defineEmits(["updateTable"])

const headers = ref([
  {
    text: "Name",
    value: "name",
    class: "blue-grey lighten-4",
  },
  {
    text: "Department",
    value: "department",
    class: "blue-grey lighten-4",
  },
  {
    text: "Branch",
    value: "branch",
    class: "blue-grey lighten-4",
  },
  {
    text: "TravelDate",
    value: "travelDate",
    class: "blue-grey lighten-4",
  },
  {
    text: "Location",
    value: "location",
    class: "blue-grey lighten-4",
  },
  {
    text: "Purpose Type",
    value: "purpose",
    class: "blue-grey lighten-4",
  },
  {
    text: "Reason",
    value: "reason",
    class: "blue-grey lighten-4",
  },
  {
    text: "Status",
    value: "status",
    class: "blue-grey lighten-4",
  },
  {
    text: "",
    value: "edit",
    class: "blue-grey lighten-4",
    cellClass: "px-0 mx-0",
    sortable: false,
    width: "1rem",
  },
])

const { travelAuthorizationPreApprovals, refresh } = useTravelAuthorizationPreApprovals()

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

async function updateTable() {
  await refresh()
  emit("updateTable")
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
