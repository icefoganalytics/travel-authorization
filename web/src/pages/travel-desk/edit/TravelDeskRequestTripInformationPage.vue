<template>
  <v-sheet>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <div
      v-else
      class="grey lighten-4"
    >
      <v-card>
        <v-card-title>
          <SectionHeader
            title="1. Passenger Name Record (PNR)"
            icon="mdi-file-document-outline"
            tag="h4"
          />
        </v-card-title>
        <v-form
          id="passenger-name-record-form"
          ref="formRef"
          @submit.prevent="save"
        >
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="travelDeskTravelRequest.invoiceNumber"
                  label="Invoice Number *"
                  :rules="[required]"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-file-input
                  v-if="hasPassengerNameRecordDocument"
                  v-model="passengerNameRecordDocumentFile"
                  label="PNR Document"
                  accept="application/pdf"
                  hint="Uploading a new PNR document will replace the existing file."
                  outlined
                  persistent-hint
                  show-size
                  truncate-length="40"
                />
                <v-file-input
                  v-else
                  v-model="passengerNameRecordDocumentFile"
                  label="PNR Document *"
                  accept="application/pdf"
                  :rules="[required]"
                  outlined
                  required
                  show-size
                  truncate-length="40"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-form>
      </v-card>

      <div class="d-flex flex-column flex-md-row">
        <v-btn
          color="primary"
          form="passenger-name-record-form"
          type="submit"
          :loading="isSaving"
          :block="smAndDown"
        >
          Save Trip Information
        </v-btn>
        <DownloadFileForm
          v-if="hasPassengerNameRecordDocument"
          class="ml-md-2"
          :download-url="downloadUrl"
          color="secondary"
          text="Download PNR"
        />
        <v-spacer />
        <v-btn
          color="warning"
          outlined
          :to="{
            name: 'travel-desk/edit/TravelDeskRequestTravelRequestPage',
            params: {
              travelDeskTravelRequestId: props.travelDeskTravelRequestId,
            },
          }"
          :block="smAndDown"
        >
          Back
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"
import { type VForm } from "vuetify/lib/components"

import { required } from "@/utils/validators"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import api from "@/api"
import { passengerNameRecordDocumentsApi } from "@/api/downloads/travel-desk-travel-requests/passenger-name-record-documents-api"
import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest, refresh } = useTravelDeskTravelRequest(
  travelDeskTravelRequestIdAsNumber
)

const passengerNameRecordDocumentFile = ref<File | null>(null)

const hasPassengerNameRecordDocument = computed(
  () => travelDeskTravelRequest.value?.hasPassengerNameRecordDocument ?? false
)
const downloadUrl = computed(() =>
  passengerNameRecordDocumentsApi.downloadPath(travelDeskTravelRequestIdAsNumber.value)
)

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function save() {
  if (isNil(travelDeskTravelRequest.value)) return
  if (isNil(formRef.value)) return

  if (
    !isNil(passengerNameRecordDocumentFile.value) &&
    passengerNameRecordDocumentFile.value.type !== "application/pdf"
  ) {
    snack.error("Only PDF files are accepted")
    return
  }

  if (!formRef.value.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  isSaving.value = true
  try {
    await travelDeskTravelRequestsApi.update(travelDeskTravelRequestIdAsNumber.value, {
      invoiceNumber: travelDeskTravelRequest.value.invoiceNumber,
    })

    if (!isNil(passengerNameRecordDocumentFile.value)) {
      await api.travelDeskTravelRequests.passengerNameRecordDocumentsApi.create(
        travelDeskTravelRequestIdAsNumber.value,
        passengerNameRecordDocumentFile.value
      )
    }

    passengerNameRecordDocumentFile.value = null
    await refresh()

    snack.success("Passenger name record saved successfully")
  } catch (error) {
    console.error(`Failed to save passenger name record: ${error}`, { error })
    snack.error(`Failed to save passenger name record: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const { smAndDown } = useDisplayVuetify2()

const breadcrumbs = computed(() => [
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    text: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditRedirect",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Trip Information (PNR details)",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTripInformationPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped></style>
