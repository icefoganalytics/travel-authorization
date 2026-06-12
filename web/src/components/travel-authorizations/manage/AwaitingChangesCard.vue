<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-baseline">
      <h3>Awaiting Changes</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsSupervisorDataTableServer
        ref="travelAuthorizationsSupervisorDataTable"
        :where="whereClause"
        route-query-suffix="AwaitingChanges"
        @click:row="goToManageTravelAuthorization"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"
import { useRouter } from "vue-router"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsSupervisorDataTableServer, {
  type TravelAuthorizationTableRow,
} from "@/components/travel-authorizations/manage/TravelAuthorizationsSupervisorDataTableServer.vue"

const whereClause = {
  status: [
    TravelAuthorizationStatuses.CHANGE_REQUESTED,
    TravelAuthorizationStatuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED,
  ],
}

const travelAuthorizationsSupervisorDataTable = useTemplateRef(
  "travelAuthorizationsSupervisorDataTable"
)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}

const router = useRouter()

async function goToManageTravelAuthorization(
  _event: unknown,
  { item: travelAuthorization }: TravelAuthorizationTableRow
) {
  await router.push({
    name: "manage-travel-requests/ManageTravelRequestExpensesPage",
    params: {
      travelAuthorizationId: travelAuthorization.id.toString(),
    },
  })
}
</script>
