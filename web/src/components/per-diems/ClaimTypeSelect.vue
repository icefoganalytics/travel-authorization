<template>
  <v-select
    :value="value"
    :items="claimTypes"
    :label="label"
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  />
</template>

<script setup>
import { useI18n } from "@/plugins/vue-i18n-plugin"
import { PER_DIEM_CLAIM_TYPES } from "@/api/per-diems-api"

defineProps({
  value: {
    type: String,
    default: () => null,
  },
  label: {
    type: String,
    default: "Claim Type",
  },
})

const emit = defineEmits(["input"])

const { t } = useI18n()
const claimTypes = Object.values(PER_DIEM_CLAIM_TYPES).map((claimType) => ({
  text: t(`per_diem.claim_type.${claimType}`, { $default: claimType }),
  value: claimType,
}))
</script>
