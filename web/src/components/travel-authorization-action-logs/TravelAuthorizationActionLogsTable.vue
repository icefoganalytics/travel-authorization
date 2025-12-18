<template>
  <v-data-table
    :headers="headers"
    :items="travelAuthorizationActionLogs"
    :loading="isLoading"
  >
    <template #item.action="{ value }">
      {{ formatAction(value) }}
    </template>
    <template #item.actorId="{ value }">
      <UserChip :user-id="value" />
    </template>
    <template #item.assigneeId="{ value }">
      <UserChip :user-id="value" />
    </template>
    <template #item.createdAt="{ value }">
      {{ formatDate(value) }}
    </template>
  </v-data-table>
</template>

<script setup>
import { startCase } from "lodash"
import { DateTime } from "luxon"
import { computed } from "vue"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import { useTravelAuthorizationActionLogs } from "@/use/use-travel-authorization-action-logs"

import UserChip from "@/components/users/UserChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const options = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
}))
const { travelAuthorizationActionLogs, isLoading, refresh } =
  useTravelAuthorizationActionLogs(options)

const headers = [
  {
    text: "Status",
    value: "action",
  },
  {
    text: "Who",
    value: "actorId",
  },
  {
    text: "Assigned To",
    value: "assigneeId",
  },
  {
    text: "Date",
    value: "createdAt",
  },
  {
    text: "Note",
    value: "note",
  },
]

const { t } = useI18n()

function formatAction(value) {
  const fallback = startCase(value.replace("_", " "))
  return t(`global.status.${value}`, { $default: fallback })
}

function formatDate(value) {
  // TODO: fix the backend so that it returns the date in ISO 8601 format
  const iso8601Value = value.replace(" ", "T")
  const date = DateTime.fromISO(iso8601Value, { zone: "utc" })
  return date.toFormat("LLLL-dd-yyyy")
}

defineExpose({
  refresh,
})
</script>
