<template>
  <v-card>
    <v-card-title>
      <h4>Flight Options Groupings</h4>
    </v-card-title>

    <TravelDeskFlightOptionEditDialog
      ref="travelDeskFlightOptionEditDialog"
      @saved="refresh"
    />

    <v-data-iterator
      :items="travelDeskFlightOptions"
      :server-items-length="totalCount"
      :items-per-page="-1"
      :loading="isLoading"
      hide-default-footer
    >
      <template #default="{ items }">
        <v-card
          v-for="(item, index) in items"
          :key="`travel-desk-flight-option-${item.id}`"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <h5>Group {{ index + 1 }}</h5>
            <v-btn
              class="my-0"
              color="primary"
              @click.stop="showEditDialog(item.id)"
              >Edit</v-btn
            >
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <TravelDeskFlightRequestDescriptionElement
                  :travel-desk-flight-request-id="item.flightRequestId"
                  label="Leg"
                  vertical
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <DescriptionElement
                  :value="'$' + item.cost"
                  label="Cost"
                  vertical
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <DescriptionElement
                  :value="item.duration"
                  label="Travel Duration"
                  vertical
                />
              </v-col>
            </v-row>
            <TravelDeskFlightSegmentsDraggable
              class="mt-4"
              :travel-desk-flight-option-id="item.id"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="error"
              :loading="isDeleting"
              @click="deleteTravelDeskFlightOption(item.id)"
            >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-data-iterator>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"

import useSnack from "@/use/use-snack"
import useTravelDeskFlightOptions from "@/use/use-travel-desk-flight-options"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import TravelDeskFlightOptionEditDialog from "@/components/travel-desk-flight-options/TravelDeskFlightOptionEditDialog.vue"
import TravelDeskFlightRequestDescriptionElement from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestDescriptionElement.vue"
import TravelDeskFlightSegmentsDraggable from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentsDraggable.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const travelDeskFlightOptionsQuery = computed(() => ({
  filters: {
    forTravelRequest: props.travelDeskTravelRequestId,
  },
}))
const { travelDeskFlightOptions, totalCount, isLoading, refresh } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightOptionEditDialog> | null>} */
const travelDeskFlightOptionEditDialog = ref(null)

function showEditDialog(flightOptionId) {
  travelDeskFlightOptionEditDialog.value?.show(flightOptionId)
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteTravelDeskFlightOption(id) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this flight option?")) return

  isDeleting.value = true
  try {
    await travelDeskFlightOptionsApi.delete(id)
    await refresh()
    snack.success("Flight option deleted.")
  } catch (error) {
    console.error("Failed to delete travel desk flight option:", error)
    snack.error(`Failed to delete travel desk flight option: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
