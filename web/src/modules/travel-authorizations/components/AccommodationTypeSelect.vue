<template>
  <v-row ref="row">
    <v-col
      cols="12"
      :md="computedColSize"
    >
      <v-select
        :value="accommodationType"
        :items="accommodationTypes"
        :label="label"
        v-bind="$attrs"
        @input="updateAccommodationType"
      />
    </v-col>
    <v-col
      v-if="showOther"
      cols="12"
      :md="computedColSize"
    >
      <v-text-field
        v-model="accommodationTypeOther"
        :label="`${label} - Other:`"
        v-bind="$attrs"
        @blur="updateAccommodationTypeOther"
      />
    </v-col>
  </v-row>
</template>

<script>
import { isNil } from "lodash"

import { ACCOMMODATION_TYPES } from "@/api/stops-api"

export default {
  name: "AccommodationTypeSelect",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null,
    },
    defaultValue: {
      type: String,
      default: ACCOMMODATION_TYPES.HOTEL,
    },
    label: {
      type: String,
      default: "Type of Accommodation",
    },
  },
  data() {
    const accommodationTypes = Object.values(ACCOMMODATION_TYPES)
    const accommodationType = this.accommodationTypeFromValue(
      accommodationTypes,
      this.value,
      this.defaultValue
    )
    const accommodationTypeOther = this.accommodationTypeOtherFromValue(
      accommodationTypes,
      this.value
    )

    return {
      ACCOMMODATION_TYPES,
      accommodationType,
      accommodationTypeOther,
      accommodationTypes,
      rowWidth: 0,
      observer: null,
    }
  },
  computed: {
    showOther() {
      return this.accommodationType === ACCOMMODATION_TYPES.OTHER
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
      this.accommodationType = this.accommodationTypeFromValue(
        this.accommodationTypes,
        newValue,
        this.defaultValue
      )
      this.accommodationTypeOther = this.accommodationTypeOtherFromValue(
        this.accommodationTypes,
        newValue
      )
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
    updateAccommodationType(value) {
      if (value === ACCOMMODATION_TYPES.OTHER) {
        this.$emit("input", this.accommodationTypeOther)
      } else {
        this.$emit("input", value)
      }

      this.accommodationType = value
    },
    updateAccommodationTypeOther() {
      this.$emit("input", this.accommodationTypeOther)
    },
    accommodationTypeFromValue(accommodationTypes, value, defaultValue) {
      if (isNil(value)) {
        return defaultValue
      }

      if (accommodationTypes.includes(value)) {
        return value
      }

      return ACCOMMODATION_TYPES.OTHER
    },
    accommodationTypeOtherFromValue(accommodationTypes, value) {
      if (accommodationTypes.includes(value)) {
        return ""
      }

      return value
    },
  },
}
</script>
