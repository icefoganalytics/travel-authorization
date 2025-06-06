<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>
    <v-card-text>
      <TripDetailsEstimatesEditForm
        ref="tripDetailsEstimatesEditForm"
        :travel-authorization-id="travelAuthorizationId"
        v-on="$listeners"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"

import generateApi from "@/api/travel-authorizations/estimates/generate-api"

import useExpenses, { TYPES as EXPENSE_TYPES } from "@/use/use-expenses"
import useSnack from "@/use/use-snack"
import { capitalize } from "@/utils/formatters"

import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"

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
  context.setEditableSteps(["edit-purpose-details"])
}

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof TripDetailsEstimatesEditForm> | null>} */
const tripDetailsEstimatesEditForm = ref(null)

const expensesQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: EXPENSE_TYPES.ESTIMATE,
  },
  perPage: 1, // only need 1 estimate to determine if there are any
}))
const { totalCount: totalCountExpenses, isReady: isReadyExpenses } = useExpenses(expensesQuery)

const snack = useSnack()

async function validateSaveAndGenerateEstimatesIfNoneExist() {
  isLoading.value = true
  try {
    if (tripDetailsEstimatesEditForm.value.validate() === false) {
      snack.error("Please fill in all required fields.")
      return false
    }

    await tripDetailsEstimatesEditForm.value.save()

    await isReadyExpenses()
    if (totalCountExpenses.value === 0) {
      await generateApi.create(props.travelAuthorizationId)
    }
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
  continue: validateSaveAndGenerateEstimatesIfNoneExist,
})
</script>
