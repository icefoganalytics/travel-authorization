<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="650px"
    @keydown.esc="close"
    @input="closeIfFalse"
  >
    <v-form
      ref="formRef"
      @submit.prevent="saveUploadAndClose"
    >
      <v-skeleton-loader
        v-if="isNil(travelDeskTravelRequest)"
        type="card"
      />
      <v-card v-else>
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Upload PNR</div>
        </v-card-title>

        <v-card-text>
          <v-row class="mx-0 mt-5">
            <v-col cols="6">
              <v-text-field
                v-model="travelDeskTravelRequest.invoiceNumber"
                :rules="[required]"
                label="Invoice Number *"
                outlined
                required
              />
            </v-col>
            <v-col cols="6">
              <TravelDeskTravelAgencySelect
                v-model="travelDeskTravelRequest.travelAgencyId"
                label="Assign Agency"
                placeholder="None"
                clearable
                outlined
                persistent-placeholder
              />
            </v-col>
          </v-row>

          <v-row
            class="mx-0 mt-1 mb-5"
            align="center"
          >
            <v-col cols="5">
              <input
                ref="fileInputRef"
                class="d-none"
                type="file"
                accept="application/pdf"
                @change="handleFileSelected"
              />
              <v-btn
                color="primary"
                :loading="isLoading"
                @click="triggerFileInput"
              >
                Upload PNR Document
              </v-btn>
            </v-col>
            <v-col
              cols="7"
              class="blue--text text-body-1 text-decoration-underline text-truncate"
            >
              <span v-if="selectedFile">
                {{ selectedFile.name }}
              </span>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn
            color="grey darken-5"
            :loading="isLoading"
            @click="close"
          >
            Close
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            type="submit"
            :loading="isLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, toRefs, watch } from "vue"

import { type VForm } from "vuetify/lib/components"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import api from "@/api"
import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const emit = defineEmits<{
  (event: "uploaded"): void
}>()

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const snack = useSnack()
const showDialog = ref(false)
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

const selectedFile = ref<File | null>(null)

watch(showDialog, () => {
  if (showDialog.value) {
    selectedFile.value = null
    formRef.value?.resetValidation()
  }
})

function triggerFileInput() {
  if (isNil(fileInputRef.value)) return

  // Reset value to allow re-selecting the same file
  fileInputRef.value.value = ""
  fileInputRef.value.click()
}

function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (isNil(target.files) || target.files.length === 0) return

  selectedFile.value = target.files[0]
}

async function saveUploadAndClose() {
  if (isNil(travelDeskTravelRequest.value)) return
  if (isNil(formRef.value)) return

  if (!formRef.value.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  if (isNil(selectedFile.value)) {
    snack.error("Please upload a PNR PDF file")
    return
  }

  if (selectedFile.value.type !== "application/pdf") {
    snack.error("Only PDF files are accepted")
    return
  }

  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.update(travelDeskTravelRequestId.value, {
      invoiceNumber: travelDeskTravelRequest.value.invoiceNumber,
      travelAgencyId: travelDeskTravelRequest.value.travelAgencyId,
    })

    await api.travelDeskTravelRequests.passengerNameRecordDocumentsApi.create(
      travelDeskTravelRequestId.value,
      selectedFile.value
    )

    emit("uploaded")
    close()
    snack.success("PNR document uploaded successfully")
  } catch (error) {
    console.error(`Failed to upload PNR document: ${error}`, { error })
    snack.error(`Failed to upload PNR document: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function open() {
  showDialog.value = true
}

function close() {
  showDialog.value = false
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) return

  close()
}

defineExpose({
  open,
})
</script>
