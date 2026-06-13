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
          :disabled="!isActionable"
          :loading="isLoading"
          @click="expense"
        >
          Approve
        </v-btn>
        <v-btn
          class="flex-grow-1"
          color="error"
          :disabled="!isActionable"
          :loading="isLoading"
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
          :disabled="!isActionable"
          :loading="isLoading"
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
          :disabled="!isActionable"
          :loading="isLoading"
          @click="sendBackToSupervisor"
        >
          Send Back to Supervisor
        </v-btn>
      </v-col>
    </v-row>
    <SendBackToTravellerDialog
      ref="sendBackToTravellerDialogRef"
      @sent-back-to-traveller="refreshAndEmitSentBackToTraveller"
    />
    <SendBackToSupervisorDialog
      ref="sendBackToSupervisorDialogRef"
      @sent-back-to-supervisor="refreshAndEmitSentBackToSupervisor"
    />
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import SendBackToTravellerDialog from "@/components/travel-authorizations/finance/SendBackToTravellerDialog.vue"
import SendBackToSupervisorDialog from "@/components/travel-authorizations/finance/SendBackToSupervisorDialog.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  approved: [travelAuthorizationId: number]
  denied: [travelAuthorizationId: number]
  sentBackToTraveller: [travelAuthorizationId: number]
  sentBackToSupervisor: [travelAuthorizationId: number]
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, refresh } = useTravelAuthorization(travelAuthorizationId)

const snack = useSnack()

const isActionable = computed(() => travelAuthorization.value?.isExpenseClaimApproved)

async function expense() {
  if (
    !blockedToTrueConfirm("Are you sure you want to mark this travel authorization as expensed?")
  ) {
    return
  }

  isLoading.value = true
  try {
    await travelAuthorizationsApi.expense(props.travelAuthorizationId)
    snack.success("Travel authorization expensed!")
    await refresh()
    emit("approved", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to expense travel authorization: ${error}`, { error })
    snack.error(`Failed to expense travel authorization: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function deny() {
  if (!blockedToTrueConfirm("Are you sure you want to deny this expense claim?")) {
    return
  }

  isLoading.value = true
  try {
    await travelAuthorizationsApi.denyExpenseClaim(props.travelAuthorizationId)
    snack.success("Expense claim denied!")
    await refresh()
    emit("denied", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to deny travel authorization: ${error}`, { error })
    snack.error(`Failed to deny travel authorization: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const sendBackToTravellerDialogRef = useTemplateRef("sendBackToTravellerDialogRef")

function sendBackToTraveler() {
  sendBackToTravellerDialogRef.value?.open(props.travelAuthorizationId)
}

async function refreshAndEmitSentBackToTraveller(travelAuthorizationId: number) {
  await refresh()
  emit("sentBackToTraveller", travelAuthorizationId)
}

const sendBackToSupervisorDialogRef = useTemplateRef("sendBackToSupervisorDialogRef")

function sendBackToSupervisor() {
  sendBackToSupervisorDialogRef.value?.open(props.travelAuthorizationId)
}

async function refreshAndEmitSentBackToSupervisor(travelAuthorizationId: number) {
  await refresh()
  emit("sentBackToSupervisor", travelAuthorizationId)
}
</script>
