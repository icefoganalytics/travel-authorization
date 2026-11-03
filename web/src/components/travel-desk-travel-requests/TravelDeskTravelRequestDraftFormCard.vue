<template>
  <div>
    <v-alert
      v-if="saveError"
      type="error"
      class="mb-4"
    >
      {{ saveError }}
    </v-alert>
    <TravelerDetailsFormCard
      ref="travelerForm"
      v-model="travelDeskTravelRequest"
    />
    <TravelDeskTravelRequestEditCard
      :travel-desk-travel-request-id="travelDeskTravelRequestId"
      :return-to="returnTo"
    />
    <div class="d-flex ga-2 mt-4">
      <v-btn
        :loading="isSaving"
        @click="saveDraft"
      >
        Save Draft
      </v-btn>
      <v-btn
        color="primary"
        :loading="isSaving"
        @click="submitDraft"
      >
        Submit Travel Desk Request
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { isNil } from "lodash"

import travelDeskTravelRequestsApi, {
  type TravelDeskTravelRequestAsShow,
} from "@/api/travel-desk-travel-requests-api"
import useSnack from "@/use/use-snack"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"
import TravelDeskTravelRequestEditCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestEditCard.vue"

defineProps<{
  travelDeskTravelRequestId: number
  returnTo: string
}>()

const travelDeskTravelRequest = defineModel<TravelDeskTravelRequestAsShow>({
  required: true,
})

const emit = defineEmits<{
  submitted: []
}>()

const snack = useSnack()
const isSaving = ref(false)
const saveError = ref("")
const travelerForm = useTemplateRef("travelerForm")

async function saveDraft() {
  if (isSaving.value) return

  isSaving.value = true
  saveError.value = ""
  try {
    const { travelDeskTravelRequest: savedRequest } = await travelDeskTravelRequestsApi.update(
      travelDeskTravelRequest.value.id,
      travelDeskTravelRequest.value
    )
    travelDeskTravelRequest.value = savedRequest
    snack.success("Draft saved.")
  } catch (error) {
    console.error(error)
    saveError.value = "The draft could not be saved."
  } finally {
    isSaving.value = false
  }
}

async function submitDraft() {
  if (isSaving.value || isNil(travelerForm.value)) return

  const validation = await travelerForm.value.validate()
  if (!validation.valid) {
    snack.error("Form validation failed. Please complete the required fields.")
    return
  }

  isSaving.value = true
  try {
    const { travelDeskTravelRequest: submittedRequest } = await travelDeskTravelRequestsApi.submit(
      travelDeskTravelRequest.value.id,
      travelDeskTravelRequest.value
    )
    travelDeskTravelRequest.value = submittedRequest
    emit("submitted")
    snack.success("Travel Desk Request submitted.")
  } catch (error) {
    console.error(error)
    snack.error(`Failed to submit Travel Desk Request: ${error}`)
  } finally {
    isSaving.value = false
  }
}
</script>
