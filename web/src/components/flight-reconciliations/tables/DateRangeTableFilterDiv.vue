<template>
  <div class="d-flex flex-column flex-md-row align-center">
    <v-col
      cols="12"
      md="8"
      class="pa-0"
    >
      <DatePickerRangeDialog
        v-model="dateRange"
        label="Records date range"
        :activator-props="{
          outlined: true,
          dense: true,
          hideDetails: true,
        }"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
      class="pb-0 px-0 py-md-0 pl-md-4"
    >
      <v-btn
        v-if="isEmpty(dateRange)"
        class="my-0"
        color="primary"
        block
        primary
        @click="resetDateRange"
      >
        <v-icon
          size="small"
          start
          >mdi-refresh</v-icon
        >
        Reset
      </v-btn>
      <v-btn
        v-else
        class="my-0"
        color="primary"
        block
        primary
        @click="clearDateRange"
      >
        <v-icon
          size="small"
          start
          >mdi-close</v-icon
        >
        Clear
      </v-btn>
    </v-col>
  </div>
</template>

<script setup>
import { watch } from "vue"
import { isEmpty } from "lodash"
import { DateTime } from "luxon"

import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"

import DatePickerRangeDialog from "@/components/common/DatePickerRangeDialog.vue"

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  loaded: {
    type: Boolean,
    default: false,
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["update:modelValue", "update:loaded"])

const INITIAL_DATE_RANGE = [
  DateTime.local().toISODate(),
  DateTime.local().minus({ days: 1 }).toISODate(),
]

const INTIAL_DATE_RANGE_AS_STRING = JSON.stringify(INITIAL_DATE_RANGE)

const dateRange = useRouteQuery(`dateRange${props.routeQuerySuffix}`, INTIAL_DATE_RANGE_AS_STRING, {
  transform: jsonTransformer,
})

watch(
  () => dateRange.value,
  (newValue, oldValue) => {
    if (props.loaded === false && oldValue === undefined) {
      emit("update:loaded", true)
    }

    emit("update:modelValue", newValue)
  },
  { immediate: true, deep: true }
)

function clearDateRange() {
  dateRange.value = []
}

function resetDateRange() {
  dateRange.value = INITIAL_DATE_RANGE
}
</script>
