<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Management"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
        class="d-flex ga-2"
      >
        <v-btn
          class="flex-grow-1"
          color="success"
          :loading="isExpensing"
          @click="expense"
        >
          Approve
        </v-btn>
        <v-btn
          class="flex-grow-1"
          color="error"
          :loading="isDenying"
          @click="deny"
        >
          Deny
        </v-btn>
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-btn
          block
          variant="outlined"
          @click="sendBackToTraveler"
        >
          Send Back to Traveler
        </v-btn>
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-btn
          block
          variant="outlined"
          @click="sendBackToSupervisor"
        >
          Send Back to Supervisor
        </v-btn>
      </v-col>
    </v-row>
    <RequestExpenseClaimChangesDialog
      ref="requestExpenseClaimChangesDialogRef"
      @changes-requested="refreshAndEmitChangesRequested"
    />
    <ReturnToExpenseClaimSubmittedDialog
      ref="returnToExpenseClaimSubmittedDialogRef"
      @returned-to-expense-claim-submitted="refreshAndEmitReturnedToExpenseClaimSubmitted"
    />
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { ref, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import RequestExpenseClaimChangesDialog from "@/components/travel-authorizations/finance/RequestExpenseClaimChangesDialog.vue"
import ReturnToExpenseClaimSubmittedDialog from "@/components/travel-authorizations/finance/ReturnToExpenseClaimSubmittedDialog.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  approved: [travelAuthorizationId: number]
  denied: [travelAuthorizationId: number]
  changesRequested: [travelAuthorizationId: number]
  returnedToExpenseClaimSubmitted: [travelAuthorizationId: number]
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, refresh } = useTravelAuthorization(travelAuthorizationId)

const snack = useSnack()

const isExpensing = ref(false)
const isDenying = ref(false)

async function expense() {
  if (
    !blockedToTrueConfirm("Are you sure you want to mark this travel authorization as expensed?")
  ) {
    return
  }

  isExpensing.value = true
  try {
    await travelAuthorizationsApi.expense(props.travelAuthorizationId)
    snack.success("Travel authorization expensed!")
    await refresh()
    emit("approved", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to expense travel authorization: ${error}`, { error })
    snack.error(`Failed to expense travel authorization: ${error}`)
  } finally {
    isExpensing.value = false
  }
}

async function deny() {
  isDenying.value = true
  try {
    await travelAuthorizationsApi.denyExpenseClaim(props.travelAuthorizationId)
    snack.success("Expense claim denied!")
    await refresh()
    emit("denied", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to deny travel authorization: ${error}`, { error })
    snack.error(`Failed to deny travel authorization: ${error}`)
  } finally {
    isDenying.value = false
  }
}

const requestExpenseClaimChangesDialogRef = useTemplateRef("requestExpenseClaimChangesDialogRef")

function sendBackToTraveler() {
  requestExpenseClaimChangesDialogRef.value?.open(props.travelAuthorizationId)
}

async function refreshAndEmitChangesRequested(travelAuthorizationId: number) {
  await refresh()
  emit("changesRequested", travelAuthorizationId)
}

const returnToExpenseClaimSubmittedDialogRef = useTemplateRef(
  "returnToExpenseClaimSubmittedDialogRef"
)

function sendBackToSupervisor() {
  returnToExpenseClaimSubmittedDialogRef.value?.open(props.travelAuthorizationId)
}

async function refreshAndEmitReturnedToExpenseClaimSubmitted(travelAuthorizationId: number) {
  await refresh()
  emit("returnedToExpenseClaimSubmitted", travelAuthorizationId)
}
</script>
