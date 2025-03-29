<template>
  <!-- TODO: re-write this so that it accepts where/filters and loads the profiles internally? -->
  <v-chip
    outlined
    v-bind="$attrs"
  >
    <template v-if="travelAuthorizationPreApprovalProfiles.length === 0"> Unspecified </template>
    <template v-else-if="travelAuthorizationPreApprovalProfiles.length === 1">
      {{ travelAuthorizationPreApprovalProfiles[0].profileName }}
    </template>
    <v-tooltip
      v-else
      top
    >
      <template #activator="{ on }">
        <div v-on="on">
          <span>
            {{ travelAuthorizationPreApprovalProfiles[0].profileName }}
          </span>
          <span>, ... </span>
        </div>
      </template>
      <span>
        <div
          v-for="profile in travelAuthorizationPreApprovalProfiles"
          :key="profile.id"
        >
          {{ profile.profileName }}
        </div>
      </span>
    </v-tooltip>
  </v-chip>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  travelAuthorizationPreApproval: {
    type: Object,
    required: true,
  },
})

const travelAuthorizationPreApprovalProfiles = computed(() => {
  return props.travelAuthorizationPreApproval.profiles || []
})
</script>
