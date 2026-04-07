<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :value="value"
    :items="requestTypeItems"
    :label="label"
    v-bind="$attrs"
    @input="emit('input', $event)"
  >
    <template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { TRAVEL_DESK_QUESTION_REQUEST_TYPES } from "@/api/travel-desk-questions-api"

defineProps({
  value: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: "Request Type",
  },
})

const emit = defineEmits(["input"])
const { t } = useI18n()

const requestTypeItems = computed(() =>
  Object.values(TRAVEL_DESK_QUESTION_REQUEST_TYPES).map((requestType) => ({
    text: t(`travel_desk_question.request_type.${requestType}`, requestType),
    value: requestType,
  }))
)
</script>
