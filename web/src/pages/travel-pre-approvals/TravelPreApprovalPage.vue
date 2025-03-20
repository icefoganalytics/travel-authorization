<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApproval)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Travel Pre-Approval"
    header-tag="h2"
    header-class="mb-0"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        variant="outlined"
        :loading="isDeleting"
        @click="deleteDialog = true"
      >
        Delete
      </v-btn>
    </template>
    <v-card-text>
      <v-row class="mt-5">
        <v-col cols="3">
          <DescriptionElement
            label="Purpose"
            :value="travelAuthorizationPreApproval.purpose"
            vertical
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="8">
          <DescriptionElement
            label="Location"
            :value="travelAuthorizationPreApproval.location"
            vertical
          />
        </v-col>
      </v-row>

      <v-row class="mt-n5">
        <v-col cols="3">
          <DescriptionElement
            label="Estimated Cost ($)"
            :value="travelAuthorizationPreApproval.cost"
            vertical
          />
          <DescriptionElement
            label="Start Date"
            :value="travelAuthorizationPreApproval.startDate"
            vertical
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="8">
          <DescriptionElement
            label="Reason"
            :value="travelAuthorizationPreApproval.reason"
            vertical
          />
        </v-col>
      </v-row>

      <v-row class="mt-n5">
        <v-col cols="3">
          <DescriptionElement
            label="End Date"
            :value="travelAuthorizationPreApproval.endDate"
            vertical
          />
        </v-col>
        <v-col cols="1" />
        <v-col
          v-if="travelAuthorizationPreApproval.unknownDate"
          cols="8"
        >
          <v-row>
            <v-col cols="5">
              <DescriptionElement
                label="Exact Date Unknown"
                :value="travelAuthorizationPreApproval.unknownDate ? 'Yes' : 'No'"
                vertical
              />
            </v-col>
            <v-col cols="5">
              <DescriptionElement
                label="Anticipated Month"
                :value="travelAuthorizationPreApproval.anticipatedMonth"
                vertical
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <div id="traveller-detail">Traveller Details</div>
      <v-card outlined>
        <v-row class="mt-5 mx-3">
          <v-col cols="6">
            <DescriptionElement
              label="Department"
              :value="travelAuthorizationPreApproval.department"
              vertical
            />
          </v-col>
          <v-col cols="6">
            <DescriptionElement
              label="Branch"
              :value="travelAuthorizationPreApproval.branch"
              vertical
            />
          </v-col>
        </v-row>

        <v-row v-if="travelAuthorizationPreApproval.undefinedTraveller">
          <v-col cols="1" />
          <v-col cols="3">
            <DescriptionElement
              label="Exact Traveler Not Known"
              :value="travelAuthorizationPreApproval.undefinedTraveller ? 'Yes' : 'No'"
              vertical
            />
          </v-col>
          <v-col cols="4">
            <DescriptionElement
              label="Number of Travellers"
              :value="travelAuthorizationPreApproval.profilesNum"
              vertical
            />
          </v-col>
        </v-row>

        <v-row class="mt-5 mx-3">
          <v-col cols="9">
            <!-- TODO: move this to its own component and load data from "where" travelAuthorizationPreApprovalId -->
            <v-data-table
              :headers="headers"
              :items="preApprovalProfiles"
              hide-default-footer
              class="elevation-1"
            >
            </v-data-table>
          </v-col>
        </v-row>

        <v-row class="mx-3">
          <v-col cols="12">
            <DescriptionElement
              label="Traveller Notes"
              :value="travelAuthorizationPreApproval.travelerNotes"
              vertical
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- TODO: move this to its own component and load data internally -->
      <v-card
        v-if="!isNil(preApprovalSubmission)"
        class="mt-5 grey lighten-5"
        outlined
      >
        <v-card-title
          class="grey lighten-5"
          style="border-bottom: 1px solid black"
        >
          <div
            v-if="preApprovalSubmission.status === 'approved'"
            class="text-h5"
          >
            Approval
          </div>
          <div
            v-else
            class="text-h5 red--text"
          >
            Declined
          </div>
        </v-card-title>
        <v-row class="mt-0 mx-3">
          <v-col cols="5">
            <v-text-field
              :value="preApprovalSubmission.approverId"
              readonly
              hide-details
              :label="preApprovalSubmission.status === 'approved' ? 'Approved By' : 'Signed By'"
              outlined
            />
          </v-col>
          <v-col cols="1" />
          <v-col cols="5">
            <v-btn
              :loading="loadingData"
              color="transparent"
              @click="downloadPdf"
              ><span class="text-h6 primary--text text-decoration-underline">
                <b v-if="preApprovalSubmission.status === 'approved'">approval</b>
                doc.pdf</span
              >
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="mx-3 mt-n5 mb-5">
          <v-col cols="3">
            <v-text-field
              :value="preApprovalSubmission.approvedAt"
              readonly
              hide-details
              :label="preApprovalSubmission.status === 'approved' ? 'Approval Date' : 'Date'"
              outlined
              type="date"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-card-text>

    <template #actions>
      <!-- TODO: implement edit page -->
      <v-btn color="primary"> Edit </v-btn>
      <v-btn
        color="warning"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalRequestsPage',
        }"
      >
        Return
      </v-btn>
    </template>

    <!-- TODO: move to a component -->
    <v-dialog
      :value="deleteDialog"
      persistent
      max-width="400px"
    >
      <v-card>
        <v-card-title
          class="amber accent-2"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Delete Travel Request</div>
        </v-card-title>

        <v-card-text> </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="ml-auto"
            color="red darken-1"
            @click="deleteTravelRequest"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"

import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalId } = toRefs(props)
const { travelAuthorizationPreApproval } = useTravelAuthorizationPreApproval(
  travelAuthorizationPreApprovalId
)

const preApprovalProfiles = computed(() => travelAuthorizationPreApproval.value?.profiles)
const preApprovalSubmission = computed(() => travelAuthorizationPreApproval.value?.submission)

const headers = ref([
  {
    text: "Name",
    value: "profileName",
  },
  {
    text: "Dept.",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
])

const isDeleting = ref(false)
const loadingData = ref(false)
const deleteDialog = ref(false)

async function downloadPdf() {
  loadingData.value = true
  try {
    const header = {
      responseType: "application/pdf",
      headers: {
        "Content-Type": "application/text",
      },
    }

    const { data } = await http.get(
      `${PREAPPROVED_URL}/document/${travelAuthorizationPreApproval.value.submissionId}`,
      header
    )
    loadingData.value = false
    const link = document.createElement("a")
    link.href = data
    document.body.appendChild(link)
    link.download = "approval_doc.pdf"
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.error(`Failed to download PDF: ${error}`)
  } finally {
    loadingData.value = false
  }
}

async function deleteTravelRequest() {
  deleteDialog.value = false
  isDeleting.value = true
  try {
    await http.delete(`${PREAPPROVED_URL}/${props.travelAuthorizationPreApprovalId}`)
  } catch (error) {
    console.error(`Failed to delete travel request: ${error}`)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
#traveller-detail {
  position: relative;
  top: 12px;
  left: 15px;
  width: 20%;
  font-size: 15pt;
  height: 100%;
  background: rgb(255, 255, 255);
  z-index: 99;
}

::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
