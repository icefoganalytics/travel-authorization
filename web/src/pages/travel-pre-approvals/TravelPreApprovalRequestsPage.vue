<template>
  <TravelAuthorizationPreApprovalsDataTableServer
    ref="travelAuthorizationPreApprovalsDataTable"
    v-model="selectedItemIds"
    :show-select="canAdminTravelPreApprovals"
  >
    <template #top>
      <v-row>
        <v-col class="d-flex flex-column flex-md-row align-center">
          <!-- TODO: make all of these buttons full width on small screens -->
          <v-spacer />
          <ConditionalTooltipButton
            color="primary"
            :disabled="isEmpty(selectedItemIds)"
            tooltip-text="Select draft items to enable the submit action."
            :block="smAndDown"
            @click="showTravelAuthorizationPreApprovalSubmissionDialog"
          >
            Submit Selected Requests
            <TravelAuthorizationPreApprovalSubmissionDialog
              v-if="canAdminTravelPreApprovals"
              ref="travelAuthorizationPreApprovalSubmissionDialog"
              @submitted="refresh"
            />
          </ConditionalTooltipButton>

          <v-btn
            v-if="canAdminTravelPreApprovals"
            class="ml-md-5"
            color="primary"
            variant="outlined"
            :block="smAndDown"
            @click="showTravelAuthorizationPreApprovalsPrintDialog"
          >
            Print Report
            <TravelAuthorizationPreApprovalsPrintDialog
              ref="travelAuthorizationPreApprovalsPrintDialog"
            />
          </v-btn>
          <TravelAuthorizationPreApprovalsExportToCsvButton
            v-if="canAdminTravelPreApprovals"
            class="ml-md-5"
            color="primary"
            variant="outlined"
            :block="smAndDown"
          >
            Export To Excel
          </TravelAuthorizationPreApprovalsExportToCsvButton>
          <v-btn
            class="ml-md-5"
            color="primary"
            :to="{
              name: 'travel-pre-approvals/TravelPreApprovalNewPage',
            }"
            :variant="addTravelPreApprovalButtonVariant"
            :block="smAndDown"
          >
            Add Travel Pre-Approval
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </TravelAuthorizationPreApprovalsDataTableServer>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty } from "lodash"
import { useDisplay } from "vuetify"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"

import TravelAuthorizationPreApprovalsExportToCsvButton from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsExportToCsvButton.vue"
import TravelAuthorizationPreApprovalsDataTableServer from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsDataTableServer.vue"
import TravelAuthorizationPreApprovalsPrintDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsPrintDialog.vue"
import TravelAuthorizationPreApprovalSubmissionDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalSubmissionDialog.vue"

const { smAndDown } = useDisplay()

const selectedItemIds = ref([])

const addTravelPreApprovalButtonVariant = computed(() => {
  if (isEmpty(selectedItemIds.value)) {
    return undefined
  }

  return "outlined"
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

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsDataTableServer> | null>} */
const travelAuthorizationPreApprovalsDataTable = ref(null)

function refresh() {
  selectedItemIds.value = []
  travelAuthorizationPreApprovalsDataTable.value?.refresh()
}

useBreadcrumbs([
  {
    title: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
  {
    title: "Requests",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
])
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
