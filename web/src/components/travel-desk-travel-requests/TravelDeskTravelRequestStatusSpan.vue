<template>
  <span>
    {{ formattedStatus }}
    <v-icon
      v-if="status === TravelDeskTravelRequestStatuses.SUBMITTED"
      color="error"
    >
      mdi-flag
    </v-icon>
    <v-icon
      v-else-if="status === TravelDeskTravelRequestStatuses.OPTIONS_RANKED"
      color="warning"
    >
      mdi-flag
    </v-icon>
    <v-icon
      v-else-if="status === TravelDeskTravelRequestStatuses.BOOKED"
      color="success"
    >
      mdi-checkbox-marked
    </v-icon>
  </span>
</template>

<script setup lang="ts">
import { isEmpty } from "lodash"
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import {
  type TravelDeskTravelRequestAsIndex,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

const props = defineProps<{
  status: TravelDeskTravelRequestStatuses
  travelDeskOfficer: TravelDeskTravelRequestAsIndex["travelDeskOfficer"]
}>()

const { t } = useI18n()

const formattedStatus = computed(() => {
  // TODO: Consider an explicit "Not Started" status; inferring workflow state
  // from the absence of an assigned officer is ambiguous.
  if (
    props.status === TravelDeskTravelRequestStatuses.SUBMITTED &&
    isEmpty(props.travelDeskOfficer)
  ) {
    return t("travel_desk_travel_request.status.not_started")
  }

  return t(`travel_desk_travel_request.status.${props.status}`, props.status)
})
</script>
