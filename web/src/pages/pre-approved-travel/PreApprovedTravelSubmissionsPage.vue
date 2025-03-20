<template>
  <div class="mt-15 mx-10 mb-5">
    <v-data-table
      :headers="headers"
      :items="travelSubmissions"
      :items-per-page="5"
      class="elevation-1"
    >
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template #item.submissionDate="{ item }">
        <!-- eslint-disable-next-line vue/no-parsing-error -->
        {{ item.submissionDate | beautifyDate }}
      </template>
      <template #item.location="{ item }">
        {{ item.preApprovals.map((p) => p.location).join(" - ") }}
      </template>
      <template #item.edit="{ item }">
        <v-row>
          <div style="width: 4.5rem">
            <SubmitTravel
              v-if="item.status === STATUSES.DRAFT && admin"
              :submission-id="item.preTSubID"
              :edit-button="true"
              button-name="Edit"
              :travel-requests="travelRequests"
              :selected-requests="item.preApprovals"
              @updateTable="updateTable"
            />
          </div>
          <div style="width: 6.75rem">
            <ApproveTravel
              v-if="item.status === STATUSES.SUBMITTED && admin"
              :travel-requests="item.preApprovals"
              :submission-id="item.preTSubID"
              @updateTable="updateTable"
            />
          </div>
          <div style="width: 5.75rem">
            <PrintReport
              v-if="admin"
              :id="item.preTSubID"
              :travel-requests="item.preApprovals"
              :button-inside-table="true"
              button-name="Print"
            />
          </div>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue from "vue"

import { STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"
import ApproveTravel from "@/modules/preapproved/views/Submissions/ApproveTravel.vue"

export default {
  name: "Submissions",
  components: {
    PrintReport,
    SubmitTravel,
    ApproveTravel,
  },
  props: {
    travelSubmissions: {
      type: Array,
      default: () => [],
    },
    travelRequests: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        {
          text: "Submission Date",
          value: "submissionDate",
          class: "blue-grey lighten-4",
        },
        {
          text: "Department",
          value: "department",
          class: "blue-grey lighten-4",
        },
        {
          text: "Location",
          value: "location",
          class: "blue-grey lighten-4",
        },
        {
          text: "Submitter",
          value: "submitter",
          class: "blue-grey lighten-4",
        },
        {
          text: "Status",
          value: "status",
          class: "blue-grey lighten-4",
        },
        {
          text: "",
          sortable: false,
          value: "edit",
          class: "blue-grey lighten-4",
          width: "18rem",
        },
      ],
      admin: false,
    }
  },
  computed: {
    STATUSES() {
      return STATUSES
    },
  },
  mounted() {
    this.admin = Vue.filter("isAdmin")()

    const dialogId = this.$store.state.preapproved.openDialogId
    const el = document.getElementById(dialogId)
    if (el) {
      this.$store.commit("preapproved/SET_OPEN_DIALOG_ID", "")
      el.click()
    }
  },
  methods: {
    updateTable() {
      this.$emit("updateTable")
    },
  },
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
