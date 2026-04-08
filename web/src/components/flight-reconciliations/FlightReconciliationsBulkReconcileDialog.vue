<template>
  <v-dialog
    v-model="showDialog"
    max-width="400px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndHide"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <h2>Reconcile Flights</h2>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <FlightReconciliationPeriodSelect
                v-model="flightReconciliationBulkAttributes.reconcilePeriod"
                label="What Period? *"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :loading="isLoading"
            color="warning"
            outlined
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Reconcile
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { cloneDeep, isEmpty, isNil } from "lodash"

import { required } from "@/utils/validators"

import flightReconciliationsApi from "@/api/flight-reconciliations-api"

import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import FlightReconciliationPeriodSelect from "@/components/flight-reconciliations/FlightReconciliationPeriodSelect.vue"

const emit = defineEmits(["saved"])

const flightReconciliationIds = useRouteQuery("showFlightReconciliationsBulkReconcile", undefined, {
  transform: jsonTransformer,
})

const flightReconciliationBulkAttributes = ref({
  reconcilePeriod: null,
})

function show(newFlightReconciliationIds) {
  flightReconciliationIds.value = newFlightReconciliationIds
}

function hide() {
  flightReconciliationIds.value = undefined
}

const showDialog = ref(false)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/components").VForm> | null>} */
const form = ref(null)

watch(
  () => cloneDeep(flightReconciliationIds.value),
  (newFlightReconciliationIds) => {
    if (isNil(newFlightReconciliationIds) || isEmpty(newFlightReconciliationIds)) {
      showDialog.value = false
      flightReconciliationBulkAttributes.value = {
        reconcilePeriod: null,
      }
      form.value?.resetValidation()
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

const isLoading = ref(false)
const snack = useSnack()

async function updateAndHide() {
  if (!form.value?.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  isLoading.value = true
  try {
    const updatedFlightReconciliationIds = []
    for (const flightReconciliationId of flightReconciliationIds.value) {
      const attributes = {
        ...flightReconciliationBulkAttributes.value,
        reconciled: true,
      }
      const { flightReconciliation } = await flightReconciliationsApi.update(
        flightReconciliationId,
        attributes
      )
      updatedFlightReconciliationIds.push(flightReconciliation.id)
    }
    hide()

    await nextTick()
    emit("saved", updatedFlightReconciliationIds)
    snack.success("Flights reconciled successfully")
  } catch (error) {
    console.error(`Failed to reconcile flights: ${error}`, { error })
    snack.error(`Failed to reconcile flights: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function hideIfFalse(value) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>

<style scoped></style>
