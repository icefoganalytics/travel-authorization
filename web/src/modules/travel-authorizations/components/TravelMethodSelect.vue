<template>
  <v-row ref="row">
    <v-col
      cols="12"
      :md="computedColSize"
    >
      <v-select
        v-model="travelMethod"
        :items="travelMethods"
        :label="label"
        v-bind="$attrs"
        @change="updateFromTravelMethod"
      />
    </v-col>
    <v-col
      v-if="showOther"
      cols="12"
      :md="computedColSize"
    >
      <v-text-field
        v-model="travelMethodOther"
        :label="`${label} - Other:`"
        v-bind="$attrs"
        @blur="updateFromTravelMethodOther"
      />
    </v-col>
  </v-row>
</template>

<script>
import { isNil } from "lodash"

import { TRAVEL_METHODS } from "@/api/stops-api"

export default {
  name: "TravelMethodSelect",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: TRAVEL_METHODS.AIRCRAFT,
    },
    label: {
      type: String,
      default: "Travel Method",
    },
  },
  data() {
    const travelMethods = Object.values(TRAVEL_METHODS)
    const travelMethod = this.travelMethodFromValue(travelMethods, this.value)
    const travelMethodOther = this.travelMethodOtherFromValue(travelMethods, this.value)

    return {
      TRAVEL_METHODS,
      travelMethods,
      travelMethod,
      travelMethodOther,
      rowWidth: 0,
      observer: null,
    }
  },
  computed: {
    showOther() {
      return this.travelMethod === TRAVEL_METHODS.OTHER
    },
    computedColSize() {
      if (this.showOther) {
        return 6
      }

      return this.rowWidth > this.$vuetify.breakpoint.thresholds.xs ? 6 : 12
    },
  },
  watch: {
    value(newValue) {
      this.travelMethod = this.travelMethodFromValue(this.travelMethods, newValue)
      this.travelMethodOther = this.travelMethodOtherFromValue(this.travelMethods, newValue)
    },
  },
  mounted() {
    this.observer = new ResizeObserver(([entry]) => {
      this.rowWidth = entry.contentRect.width
    })
    this.observer.observe(this.$refs.row)
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    updateFromTravelMethod() {
      if (this.travelMethod === TRAVEL_METHODS.OTHER) return

      this.$emit("input", this.travelMethod)
    },
    updateFromTravelMethodOther() {
      this.$emit("input", this.travelMethodOther)
    },
    travelMethodFromValue(travelMethods, value) {
      if (isNil(value)) {
        return value
      }

      if (travelMethods.includes(value)) {
        return value
      }

      return TRAVEL_METHODS.OTHER
    },
    travelMethodOtherFromValue(travelMethods, value) {
      if (travelMethods.includes(value)) {
        return ""
      }

      return value
    },
  },
}
</script>
