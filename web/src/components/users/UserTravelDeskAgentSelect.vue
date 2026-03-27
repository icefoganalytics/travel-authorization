<template>
  <v-select
    :value="value"
    :items="usersDisplayNames"
    :label="label"
    :loading="isLoading"
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useUsers, { type UserFiltersOptions, type UserWhereOptions } from "@/use/use-users"

withDefaults(
  defineProps<{
    value?: string | null
    label?: string
    where?: UserWhereOptions
    filters?: UserFiltersOptions
  }>(),
  {
    value: null,
    label: "Travel Desk Agent",
    where: () => ({}),
    filters: () => ({}),
  }
)

/**
 * @type {{
 *   input: [userDisplayName: string | null]
 * }}
 */
const emit = defineEmits<{
  (event: "input", value: string | null): void
}>()

const usersQuery = computed(() => ({
  filters: {
    isTravelDeskUser: true,
  },
  // TODO: replace max per page with search feature
  perPage: MAX_PER_PAGE,
}))
const { users, isLoading } = useUsers(usersQuery)

const usersDisplayNames = computed(() =>
  users.value.map(({ firstName, lastName }) => [firstName, lastName].filter(Boolean).join(" "))
)
</script>
