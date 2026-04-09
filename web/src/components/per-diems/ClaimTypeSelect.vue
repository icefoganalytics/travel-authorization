<template>
  <v-select
    :model-value="modelValue"
    :items="claimTypes"
    :label="label"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { useI18n } from "vue-i18n"

import { PER_DIEM_CLAIM_TYPES } from "@/api/per-diems-api"

defineProps({
  modelValue: {
    type: String,
    default: () => null,
  },
  label: {
    type: String,
    default: "Claim Type",
  },
})

const emit = defineEmits(["update:modelValue"])

const { t } = useI18n()
const claimTypes = Object.values(PER_DIEM_CLAIM_TYPES).map((claimType) => ({
  title: t(`per_diem.claim_type.${claimType}`, claimType),
  value: claimType,
}))
</script>
