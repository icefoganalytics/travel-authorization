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
              <p>
                By unreconciling these records, the period will be removed and the record will be
                returned to the unreconciled list.
              </p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :loading="isLoading"
            color="warning"
            variant="outlined"
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
            Unreconcile
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { cloneDeep, isEmpty, isNil } from "lodash"

import flightReconciliationsApi from "@/api/flight-reconciliations-api"

import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

const emit = defineEmits(["saved"])

const flightReconciliationIds = useRouteQuery("showFlightReconciliationsBulkEdit", undefined, {
  transform: jsonTransformer,
})

const flightReconciliationBulkAttributes = ref({})

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
      flightReconciliationBulkAttributes.value = {}
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
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill in all required fields")
    return
  }

  isLoading.value = true
  try {
    const updatedFlightReconciliationIds = []
    for (const flightReconciliationId of flightReconciliationIds.value) {
      const attributes = {
        ...flightReconciliationBulkAttributes.value,
        reconcilePeriod: null,
        reconciled: false,
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
