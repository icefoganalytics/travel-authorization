<template>
  <!-- TODO: re-write this so that it accepts where/filters and loads the profiles internally? -->
  <v-chip
    ref="chip"
    variant="outlined"
    link
    v-bind="$attrs"
  >
    <template v-if="travelAuthorizationPreApprovalProfiles.length === 0"> Unspecified </template>
    <template v-else-if="travelAuthorizationPreApprovalProfiles.length === 1">
      {{ travelAuthorizationPreApprovalProfiles[0].profileName }}
    </template>
    <template v-else> {{ travelAuthorizationPreApprovalProfiles[0].profileName }}, ... </template>

    <v-icon right>mdi-menu-down</v-icon>

    <v-menu
      :activator="chip?.$el"
      :close-on-content-click="false"
      offset-y
      transition="scale-transition"
    >
      <v-card>
        <v-list>
          <v-list-item
            v-for="profile in travelAuthorizationPreApprovalProfiles"
            :key="profile.id"
            :title="profile.profileName"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-chip>
</template>

<script setup>
import { computed, ref } from "vue"

const props = defineProps({
  travelAuthorizationPreApproval: {
    type: Object,
    required: true,
  },
})

const travelAuthorizationPreApprovalProfiles = computed(() => {
  return props.travelAuthorizationPreApproval.profiles || []
})

/** @typedef {import('vuetify/components').VChip} VChip */
/** @type {import('vue').Ref<InstanceType<typeof VChip> | null>} */
const chip = ref(null)
</script>
