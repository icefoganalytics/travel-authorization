<template>
  <v-card>
    <v-card-text>
      <ReassignApprovalForm :travel-authorization-id="travelAuthorizationId" />
      <v-row>
        <v-col class="d-flex justify-end">
          <v-btn
            color="success"
            @click="approve"
          >
            Approve
          </v-btn>
          <v-btn
            class="ml-2"
            color="error"
            @click="deny"
          >
            Deny
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useSnack } from "@/plugins/snack-plugin"
import travelAuthorizationApi from "@/api/travel-authorizations-api"

import ReassignApprovalForm from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ReassignApprovalForm.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const snack = useSnack()

function approve() {
  return travelAuthorizationApi
    .approveExpenseClaim(props.travelAuthorizationId)
    .then(() => {
      snack("Travel authorization approved!", { color: "success" })
    })
    .catch((error) => {
      snack(error.message, { color: "error" })
    })
}
function deny() {
  return travelAuthorizationApi
    .deny(props.travelAuthorizationId)
    .then(() => {
      snack("Travel authorization denied.", { color: "success" })
    })
    .catch((error) => {
      snack(error.message, { color: "error" })
    })
}
</script>
