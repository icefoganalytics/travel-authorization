<template>
  <div class="mx-10 mb-5">
    <v-row class="my-0 mx-0">
      <SubmitTravel
        v-if="admin"
        :disabled="selectedRequests.length == 0"
        :travel-requests="travelRequests"
        :selected-requests="selectedRequests"
        :submission-id="0"
        button-name="Submit Selected Travel"
        class="ml-auto"
        @updateTable="updateTable"
      />
      <PrintReport
        v-if="admin"
        :disabled="selectedRequests.length == 0"
        :travel-requests="selectedRequests"
        button-name="Print Report"
      />
      <v-btn
        v-if="admin"
        :disabled="selectedRequests.length == 0"
        class="mr-5 my-7"
        color="primary"
        @click="exportToExcel"
      >
        Export To Excel
      </v-btn>
      <new-travel-request
        type="Add New"
        :class="admin ? '' : 'ml-auto'"
        @updateTable="updateTable"
      />
    </v-row>
    <v-data-table
      v-model="selectedRequests"
      :headers="headers"
      :items="grayedOutTravelRequests"
      :items-per-page="5"
      class="elevation-1"
      :show-select="admin"
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
          :type="item.status === STATUSES.DRAFT || isNil(item.status) ? 'Edit' : 'View'"
          :travel-request="item"
          @updateTable="updateTable"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue, { ref } from "vue"
import { ExportToCsv } from "export-to-csv"
import { isNil } from "lodash"
import { DateTime } from "luxon"

import { STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useCurrentUser from "@/use/use-current-user"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"
import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"

export default {
  name: "PreapprovedRequests",
  components: {
    NewTravelRequest,
    PrintReport,
    SubmitTravel,
  },
  props: {
    travelRequests: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const { isAdmin } = useCurrentUser()

    return {
      headers: ref([
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
      ]),
      admin: isAdmin,
      selectedRequests: ref([]),
      firstSelectionDept: ref(""),
    }
  },
  computed: {
    STATUSES() {
      return STATUSES
    },
    grayedOutTravelRequests() {
      const travelRequests = JSON.parse(JSON.stringify(this.travelRequests))
      if (this.firstSelectionDept)
        travelRequests.forEach((req) => {
          req.isSelectable = req.isSelectable ? req.department == this.firstSelectionDept : false
        })
      return travelRequests
    },
  },
  methods: {
    isNil,
    updateTable() {
      this.$emit("updateTable")
    },
    applySameDeptSelection(selection) {
      Vue.nextTick(() => {
        if (this.selectedRequests.length == 1) {
          this.firstSelectionDept = this.selectedRequests[0].department
        } else if (this.selectedRequests.length == 0) {
          this.firstSelectionDept = ""
        }

        if (selection.value == true && selection.item.department != this.firstSelectionDept) {
          this.selectedRequests = this.selectedRequests.filter((req) => req.id != selection.item.id)
        }
      })
    },
    applyAllSameDeptSelection(selection) {
      console.log(selection)
      Vue.nextTick(() => {
        if (selection.value == true && this.firstSelectionDept) {
          this.selectedRequests = this.selectedRequests.filter(
            (req) => req.department == this.firstSelectionDept
          )
        } else {
          this.selectedRequests = []
          this.firstSelectionDept = ""
        }
      })
    },
    exportToExcel() {
      // The object keys must match the headers option.
      // In future versions of the library, the headers can be customized independently.
      const csvInfo = this.selectedRequests.map((req) => {
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
    },
  },
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
