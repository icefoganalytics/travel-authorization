<template>
  <v-dialog
    :model-value="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndHide"
    >
      <v-skeleton-loader
        v-if="isNil(travelDeskFlightOptionId) || isNil(travelDeskFlightOption)"
        type="card"
      />
      <v-card
        v-else
        :loading="isLoading"
      >
        <v-card-title>
          <h2>Edit Flight Option</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <TravelDeskFlightRequestSelect
                v-model="travelDeskFlightOption.flightRequestId"
                label="Leg *"
                :filters="{
                  familyOf: travelDeskFlightOption.flightRequestId,
                }"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="travelDeskFlightOption.cost"
                label="Cost *"
                type="number"
                :rules="[required]"
                prefix="$"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskFlightOption.duration"
                label="Travel Duration"
                readonly
                outlined
                append-icon="mdi-lock"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <v-skeleton-loader
                v-if="isLoadingFlightSegments"
                type="card"
              />
              <template v-else>
                <TravelDeskFlightSegmentAttributesCard
                  v-for="(travelDeskFlightSegment, index) in travelDeskFlightSegments"
                  :key="`segment-${index}`"
                  :travel-desk-flight-segment-attributes="travelDeskFlightSegment"
                />
              </template>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            outlined
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Save Flight Option
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch, computed } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTravelDeskFlightOption from "@/use/use-travel-desk-flight-option"
import useTravelDeskFlightSegments from "@/use/use-travel-desk-flight-segments"

import TravelDeskFlightRequestSelect from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestSelect.vue"
import TravelDeskFlightSegmentAttributesCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentAttributesCard.vue"

const emit = defineEmits(["saved"])

const travelDeskFlightOptionId = useRouteQuery("showFlightOptionEdit", undefined, {
  transform: integerTransformerLegacy,
})

const { travelDeskFlightOption, isLoading } = useTravelDeskFlightOption(travelDeskFlightOptionId)

const travelDeskFlightSegmentsQuery = computed(() => ({
  where: {
    flightOptionId: travelDeskFlightOptionId.value,
  },
}))
const { travelDeskFlightSegments, isLoading: isLoadingFlightSegments } =
  useTravelDeskFlightSegments(travelDeskFlightSegmentsQuery, {
    skipWatchIf: () => isNil(travelDeskFlightOptionId.value),
  })

const showDialog = ref(false)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)

function show(newTravelDeskFlightOptionId) {
  travelDeskFlightOptionId.value = newTravelDeskFlightOptionId
}

function hide() {
  travelDeskFlightOptionId.value = undefined
}

watch(
  travelDeskFlightOptionId,
  (newTravelDeskFlightOptionId) => {
    if (isNil(newTravelDeskFlightOptionId)) {
      showDialog.value = false
      travelDeskFlightOption.value = null
      form.value?.resetValidation()
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const snack = useSnack()

async function updateAndHide() {
  if (!form.value?.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  isLoading.value = true
  try {
    const { travelDeskFlightOption: newTravelDeskFlightOption } =
      await travelDeskFlightOptionsApi.update(
        travelDeskFlightOptionId.value,
        travelDeskFlightOption.value
      )
    hide()

    await nextTick()
    emit("saved", newTravelDeskFlightOption.id)
    snack.success("Flight option saved successfully")
  } catch (error) {
    console.error(error)
    snack.error("Failed to save flight option")
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

<style scoped>
.gap-4 {
  gap: 1rem; /* 16px */
}
</style>
