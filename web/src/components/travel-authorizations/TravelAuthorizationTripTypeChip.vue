<template>
  <!-- TODO: add icon for each trip type? -->
  <v-chip
    variant="outlined"
    v-bind="$attrs"
  >
    {{ formattedStatus }}
  </v-chip>
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const { t } = useI18n()

const formattedStatus = computed(() => {
  return t(`travel_authorization.trip_type.${props.modelValue}`, props.modelValue)
})
</script>
