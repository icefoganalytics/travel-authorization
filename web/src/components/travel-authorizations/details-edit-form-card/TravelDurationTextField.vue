<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <div
        class="d-flex align-start"
        v-bind="attrs"
        v-on="on"
      >
        <v-text-field
          :value="value"
          :style="{ minWidth: '80px' }"
          label="Travel Days"
          dense
          outlined
          disabled
          readonly
          v-bind="$attrs"
          v-on="$listeners"
          ><template
            v-for="(_, slotName) in $scopedSlots"
            #[slotName]="slotData"
            ><slot
              :name="slotName"
              v-bind="slotData"
            ></slot></template
        ></v-text-field>
        <v-icon
          class="ml-1"
          small
        >
          mdi-help-circle-outline
        </v-icon>
      </div>
    </template>
    <span>This is computed from the start and end dates of the trip.</span>
  </v-tooltip>
</template>

<script setup>
import { watch } from "vue"
import { DateTime } from "luxon"
import { cloneDeep, findLast, isNil, max } from "lodash"

const props = defineProps({
  value: {
    type: Number,
    default: () => 0,
  },
  stops: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(["input"])

watch(
  () => cloneDeep(props.stops),
  (newStops) => {
    const initialDepartureDate = (newStops.find((stop) => !isNil(stop.departureDate)) || {})
      .departureDate
    const finalDepartureDate = (findLast(newStops, (stop) => !isNil(stop.departureDate)) || {})
      .departureDate
    const travelDuration = computeTravelDuration(initialDepartureDate, finalDepartureDate)
    emit("input", travelDuration)
  },
  { immediate: true }
)

function computeTravelDuration(initialDepartureDate, finalDepartureDate) {
  if (isNil(initialDepartureDate) || isNil(finalDepartureDate)) {
    return null
  }

  const departureDateOrigin = DateTime.fromISO(initialDepartureDate)
  const departureDateFinal = DateTime.fromISO(finalDepartureDate)
  const timeDifference = departureDateFinal.diff(departureDateOrigin, "days")
  return max([0, timeDifference.days + 1])
}
</script>
