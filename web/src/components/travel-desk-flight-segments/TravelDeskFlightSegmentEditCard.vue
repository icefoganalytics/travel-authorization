<template>
  <v-card>
    <v-card-title>
      <h4>Flight</h4>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="flightSegmentAttributes.flightNumber"
            label="Flight *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-spacer />
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.duration"
            label="Duration *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="flightSegmentAttributes.departLocation"
            label="Depart From *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.departDay"
            label="Departure Date *"
            type="date"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.departTime"
            label="Departure Time *"
            type="time"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="flightSegmentAttributes.arriveLocation"
            label="Arrive To *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.arriveDay"
            label="Arrival Date *"
            type="date"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.arriveTime"
            label="Arrival Time *"
            type="time"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-spacer />
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="flightSegmentAttributes.status"
            label="Status *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="flightSegmentAttributes.class"
            label="Class *"
            :rules="[required]"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue"
import { watchDebounced } from "@vueuse/shared"
import { cloneDeep, isEqual } from "lodash"

import { required } from "@/utils/validators"

const props = defineProps({
  flightSegment: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["update:flightSegment"])

const flightSegmentAttributes = ref({})

watch(
  () => cloneDeep(props.flightSegment),
  (newFlightSegment) => {
    if (isEqual(newFlightSegment, flightSegmentAttributes.value)) return

    flightSegmentAttributes.value = newFlightSegment
  },
  {
    immediate: true,
    deep: true,
  }
)

watchDebounced(
  () => cloneDeep(flightSegmentAttributes.value),
  (newFlightSegmentAttributes) => {
    const { departDay, departTime, arriveDay, arriveTime } = newFlightSegmentAttributes

    if (departDay && departTime) {
      newFlightSegmentAttributes.departAt = `${departDay}T${departTime}:00.000Z`
    }

    if (arriveDay && arriveTime) {
      newFlightSegmentAttributes.arriveAt = `${arriveDay}T${arriveTime}:00.000Z`
    }

    emit("update:flightSegment", newFlightSegmentAttributes)
  },
  {
    deep: true,
    debounce: 300,
  }
)
</script>

<style scoped></style>
