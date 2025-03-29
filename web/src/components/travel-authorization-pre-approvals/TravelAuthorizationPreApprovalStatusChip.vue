<template>
  <v-chip :color="color">
    {{ formattedStatus }}
  </v-chip>
</template>

<script setup>
import { computed } from "vue"

import { useI18n } from "@/plugins/vue-i18n-plugin"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const { t } = useI18n()

const formattedStatus = computed(() => {
  return t(`travel_authorization_pre_approval.status.${props.status}`, {
    $default: props.status,
  })
})

const color = computed(() => {
  switch (props.status) {
    case TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED:
      return "info"
    case TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED:
      return "success"
    case TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED:
      return "error"
    default:
      return "info"
  }
})
</script>
