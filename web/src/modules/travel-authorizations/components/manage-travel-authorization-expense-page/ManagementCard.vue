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
import useSnack from "@/use/use-snack"
import travelAuthorizationApi from "@/api/travel-authorizations-api"

import ReassignApprovalForm from "@/modules/travel-authorizations/components/manage-travel-authorization-expense-page/ReassignApprovalForm.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["approved", "denied"])

const snack = useSnack()

async function approve() {
  try {
    await travelAuthorizationApi.approveExpenseClaim(props.travelAuthorizationId)
    snack.success("Travel authorization approved!")
    emit("approved", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to approve travel authorization: ${error}`, { error })
    snack.error(`Failed to approve travel authorization: ${error}`)
  }
}

async function deny() {
  try {
    await travelAuthorizationApi.deny(props.travelAuthorizationId)
    snack.success("Travel authorization denied!")
    emit("denied", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to deny travel authorization: ${error}`, { error })
    snack.error(`Failed to deny travel authorization: ${error}`)
  }
}
</script>
