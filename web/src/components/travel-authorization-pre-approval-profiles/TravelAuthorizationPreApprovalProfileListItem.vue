<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalProfile)"
    type="list-item-two-line"
  />
  <v-list-item-title v-else>
    <v-list-item-content>
      <v-list-item-title>{{ title }}</v-list-item-title>
      <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item-title>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import useTravelAuthorizationPreApprovalProfile from "@/use/use-travel-authorization-pre-approval-profile"

const props = defineProps({
  travelAuthorizationPreApprovalProfileId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationPreApprovalProfileId } = toRefs(props)
const { travelAuthorizationPreApprovalProfile } = useTravelAuthorizationPreApprovalProfile(
  travelAuthorizationPreApprovalProfileId
)

const title = computed(() => {
  const profile = travelAuthorizationPreApprovalProfile.value
  if (isNil(profile)) return "..."

  const { branch, profileName } = profile
  return [branch, profileName].filter(Boolean).join(" - ")
})

const subtitle = computed(() => {
  const profile = travelAuthorizationPreApprovalProfile.value
  if (isNil(profile) || isNil(profile.preApproval)) return "..."

  const { location, purpose, isOpenForAnyDate, startDate, endDate, month } = profile.preApproval
  const dateInfo = isOpenForAnyDate
    ? month
    : [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(" to ")

  return [location, purpose, dateInfo].filter(Boolean).join(" - ")
})
</script>
