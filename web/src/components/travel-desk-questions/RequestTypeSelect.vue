<!-- See https://stackoverflow.com/a/50892881 for slot syntax -->
<template>
  <v-select
    :model-value="modelValue"
    :items="requestTypeItems"
    :label="label"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import { TRAVEL_DESK_QUESTION_REQUEST_TYPES } from "@/api/travel-desk-questions-api"

defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: "Request Type",
  },
})

const emit = defineEmits(["update:modelValue"])
const { t } = useI18n()

const requestTypeItems = computed(() =>
  Object.values(TRAVEL_DESK_QUESTION_REQUEST_TYPES).map((requestType) => ({
    title: t(`travel_desk_question.request_type.${requestType}`, requestType),
    value: requestType,
  }))
)
</script>
