<template>
  <v-tooltip bottom>
    <template #activator="{ props: activatorProps }">
      <div
        class="d-flex align-start"
        v-bind="activatorProps"
      >
        <v-text-field
          :model-value="modelValue"
          :style="{ minWidth: '80px' }"
          label="Travel Days"
          dense
          variant="outlined"
          disabled
          readonly
          v-bind="$attrs"
          ><template
            v-for="(_, slotName) in $slots"
            #[slotName]="slotData"
            ><slot
              :name="slotName"
              v-bind="slotData"
            ></slot></template
        ></v-text-field>
        <v-icon
          class="ml-1"
          size="small"
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
  modelValue: {
    type: Number,
    default: () => 0,
  },
  travelSegments: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(["update:modelValue"])

watch(
  () => cloneDeep(props.travelSegments),
  (newTravelSegments) => {
    const initialDepartureDate = (
      newTravelSegments.find((travelSegment) => !isNil(travelSegment.departureOn)) || {}
    ).departureOn

    const finalDepartureDate = (
      findLast(newTravelSegments, (travelSegment) => !isNil(travelSegment.departureOn)) || {}
    ).departureOn

    const travelDuration = computeTravelDuration(initialDepartureDate, finalDepartureDate)
    emit("update:modelValue", travelDuration)
  },
  {
    deep: true,
    immediate: true,
  }
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
