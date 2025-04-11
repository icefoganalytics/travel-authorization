<template>
  <v-chip
    ref="chip"
    outlined
    link
    v-bind="$attrs"
    v-on="$listeners"
  >
    <v-progress-circular
      v-if="isLoading"
      size="20"
      width="2"
      color="white"
      indeterminate
    />
    <template v-else>
      {{ title }}
    </template>

    <v-icon right>mdi-menu-down</v-icon>
    <v-menu
      :activator="chip?.$el"
      :close-on-content-click="false"
      offset-y
      transition="scale-transition"
    >
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
          {{ subtitle }}
        </v-card-text>
      </v-card>
    </v-menu>
  </v-chip>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
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
const { travelAuthorizationPreApprovalProfile, isLoading } =
  useTravelAuthorizationPreApprovalProfile(travelAuthorizationPreApprovalProfileId)

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

/** @typedef {import('vuetify/lib/components').VChip} VChip */
/** @type {import('vue').Ref<InstanceType<typeof VChip> | null>} */
const chip = ref(null)
</script>
