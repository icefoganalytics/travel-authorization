<template>
  <v-select
    :value="value"
    :items="profiles"
    :loading="isLoading"
    label="Pre-approved travel for (if applicable)"
    no-data-text="No pre-approvals available"
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  ></v-select>
</template>

<script setup>
import { ref, watch } from "vue"
import { isEmpty, isNil } from "lodash"

import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"

/**
 * Defines component props with descriptions and types using JSDoc.
 *
 * @type {{
 *   value: number | null,
 *   queryOptions: {
 *     where?: {department?: string},
 *     filters?: {approved?: boolean, openDateOrBeforeStartDate?: boolean}
 *   }
 * }}
 */
const props = defineProps({
  value: {
    type: Number,
    default: null,
  },
  queryOptions: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["input"])

const profiles = ref([])
const isLoading = ref(false)

watch(
  () => props.queryOptions,
  async (newQueryOptions) => {
    await fetch(newQueryOptions)
  },
  { immediate: true }
)

async function fetch(queryOptions) {
  const department = queryOptions?.where?.department
  // Strip out department from query options if it is nil or empty
  if (isNil(department) || isEmpty(department)) {
    delete queryOptions.department
  }

  isLoading.value = true
  try {
    const { travelAuthorizationPreApprovalProfiles: newProfiles } =
      await travelAuthorizationPreApprovalProfilesApi.list(queryOptions)

    profiles.value = newProfiles.map(({ id, preApproval }) => {
      // TODO: consider if "profileName" should be included here?
      const { branch, location, purpose } = preApproval
      const text = [branch, location, purpose].filter(Boolean).join(" - ")
      return {
        text,
        value: id,
      }
    })
  } finally {
    isLoading.value = false
  }
}
</script>
