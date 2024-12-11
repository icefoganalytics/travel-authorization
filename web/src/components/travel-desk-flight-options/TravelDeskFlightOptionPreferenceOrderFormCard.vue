<template>
  <v-card
    class="card--outlined"
    :loading="isLoading"
  >
    <v-card-title>
      <h5>{{ title }}</h5>
    </v-card-title>
    <v-card-subtitle>
      {{ subtitle }}
    </v-card-subtitle>

    <v-divider />

    <v-card-text class="mt-4 px-0 px-md-4">
      <v-form
        :id="formId"
        ref="form"
        lazy-validation
        @submit.prevent="save"
      >
        <v-row
          v-for="(flightOption, index) in travelDeskFlightOptions"
          :key="flightOption.id"
        >
          <v-col
            cols="12"
            md="3"
            :class="{
              'mt-4 mt-md-0': index !== 0,
            }"
          >
            <!-- TODO: exclude chosen options? -->
            <FlightPreferenceOrderAutocomplete
              :value="flightOption.flightPreferenceOrder"
              label="Preference"
              :number-of-options="travelDeskFlightOptions.length"
              :rules="[required]"
              :hide-details="$vuetify.breakpoint.smAndDown"
              outlined
              required
              @input="updateAndswapIfAlreadyInUse(flightOption, $event)"
            />
          </v-col>

          <v-col
            cols="12"
            md="9"
          >
            <TravelDeskFlightSegmentsCard
              :travel-desk-flight-option-id="flightOption.id"
              :cost="flightOption.cost"
            />
          </v-col>
          <v-col
            v-if="flightOption.flightPreferenceOrder === DOES_NOT_WORK"
            cols="12"
          >
            <v-textarea
              v-model="flightOption.additionalInformation"
              label="Additional Information"
              rows="4"
              :rules="[required]"
              :hide-details="$vuetify.breakpoint.smAndDown"
              outlined
              required
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :form="formId"
        type="submit"
        :loading="isLoading"
        color="primary"
        outlined
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { times, uniqueId } from "lodash"

import { required } from "@/utils/validators"
import travelDeskFlightOptionsApi, { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"
import useSnack from "@/use/use-snack"
import useTravelDeskFlightOptions from "@/use/use-travel-desk-flight-options"

import FlightPreferenceOrderAutocomplete from "@/components/travel-desk-flight-options/FlightPreferenceOrderAutocomplete.vue"
import TravelDeskFlightSegmentsCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentsCard.vue"

const props = defineProps({
  travelDeskFlightRequestId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const travelDeskFlightOptionsQuery = computed(() => ({
  where: {
    flightRequestId: props.travelDeskFlightRequestId,
  },
}))
const { travelDeskFlightOptions, isLoading, refresh } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)

const formId = uniqueId("travel-desk-flight-option-preference-order-form-")

function updateAndswapIfAlreadyInUse(flightOption, newPreference) {
  if (newPreference === DOES_NOT_WORK) {
    flightOption.flightPreferenceOrder = newPreference
    return
  }

  const flightOptionWithSamePreference = travelDeskFlightOptions.value.find(
    (option) => option.flightPreferenceOrder === newPreference
  )
  const oldPreference = flightOption.flightPreferenceOrder
  if (flightOptionWithSamePreference && oldPreference !== DOES_NOT_WORK) {
    flightOptionWithSamePreference.flightPreferenceOrder = oldPreference
  } else if (flightOptionWithSamePreference && oldPreference === DOES_NOT_WORK) {
    const allPreferences = new Set(times(travelDeskFlightOptions.value.length, (i) => i + 1))
    const usedPreferences = new Set(
      travelDeskFlightOptions.value.map((option) => option.flightPreferenceOrder)
    )
    const unusedPreferences = allPreferences.difference(usedPreferences)
    const firstAvailableUnusedPreference = unusedPreferences.values().next().value
    flightOptionWithSamePreference.flightPreferenceOrder = firstAvailableUnusedPreference
  }

  flightOption.flightPreferenceOrder = newPreference
}

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm>>> */
const form = ref(null)

const snack = useSnack()

async function save() {
  if (!form.value.validate()) {
    snack.error("Please fill in all required fields")
    return false
  }

  isLoading.value = true
  try {
    for (const flightOptions of travelDeskFlightOptions.value) {
      await travelDeskFlightOptionsApi.update(flightOptions.id, {
        flightPreferenceOrder: flightOptions.flightPreferenceOrder,
        additionalInformation: flightOptions.additionalInformation,
      })
    }
    await refresh()
    return true
  } catch (error) {
    console.error(error)
    snack.error(`Failed to save preference order: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  save,
})
</script>
