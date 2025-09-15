<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>
    <v-card-text>
      <TripDetailsActualsEditForm
        ref="tripDetailsActualsEditForm"
        :travel-authorization-id="travelAuthorizationId"
        v-on="$listeners"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

import useSnack from "@/use/use-snack"
import { capitalize } from "@/utils/formatters"

import { TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES } from "@/api/travel-authorizations-api"

import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  stepTitle: {
    type: String,
    required: true,
  },
  stepSubtitle: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["updated"])

async function initialize(context) {
  context.setEditableSteps([TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.SUBMIT_EXPENSES])
}

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof TripDetailsActualsEditForm> | null>} */
const tripDetailsActualsEditForm = ref(null)
const snack = useSnack()

async function validateAndSave() {
  isLoading.value = true
  try {
    if (tripDetailsActualsEditForm.value.validate() === false) {
      snack.error("Please fill in all required fields.")
      return false
    }

    await tripDetailsActualsEditForm.value.save()
    snack.success("Travel request saved.")
    emit("updated", props.travelAuthorizationId)
    return true
  } catch (error) {
    console.error(`Failed to save travel request: ${error}`, { error })
    snack.error(`Failed to save travel request: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  initialize,
  continue: validateAndSave,
})
</script>
