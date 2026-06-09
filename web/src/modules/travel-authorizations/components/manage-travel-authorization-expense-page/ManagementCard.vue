<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Management"
  >
    <v-form ref="form">
      <v-row>
        <v-col
          cols="12"
          md="4"
          class="d-flex ga-2"
        >
          <ConditionalTooltipButton
            class="flex-grow-1"
            color="success"
            :disabled="!canApproveOrDeny"
            tooltip-text="Only available when the expense claim is awaiting your approval."
            @click="approveExpenseClaim"
          >
            Approve
          </ConditionalTooltipButton>
          <ConditionalTooltipButton
            class="flex-grow-1"
            color="error"
            :disabled="!canApproveOrDeny"
            tooltip-text="Only available when the expense claim is awaiting your approval."
            @click="denyExpenseClaim"
          >
            Deny
          </ConditionalTooltipButton>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <UserEmailSearchableCombobox
            v-model="travelAuthorization.supervisorEmail"
            :rules="[required]"
            label="Reassign to"
            density="compact"
            hide-details="auto"
            required
            variant="outlined"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            class="mt-0"
            block
            :loading="isLoadingTravelAuthorization"
            @click="reassign"
          >
            Reassign
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { computed, nextTick, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"
import { required } from "@/utils/validators"

import useSnack from "@/use/use-snack"
import travelAuthorizationApi from "@/api/travel-authorizations-api"
import useTravelAuthorization from "@/use/use-travel-authorization"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  approved: [travelAuthorizationId: number]
  denied: [travelAuthorizationId: number]
}>()

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  policy,
  isLoading: isLoadingTravelAuthorization,
  save,
} = useTravelAuthorization(travelAuthorizationId)

const canApproveOrDeny = computed(() => {
  if (isNil(travelAuthorization.value)) return false

  const { status } = travelAuthorization.value
  return (
    status === TravelAuthorizationStatuses.EXPENSE_CLAIM_SUBMITTED ||
    status === TravelAuthorizationStatuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED
  )
})

const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function reassign() {
  if (isNil(travelAuthorization.value)) return
  if (isNil(policy.value)) return
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  try {
    // TODO: if we want to track re-assignment we should add an action specific endpoint.
    await save()
    snack.success("Travel authorization reassigned.")

    await nextTick()
    if (!policy.value.show) {
      await router.push({
        name: "ManageTravelRequests",
      })
    }
  } catch (error) {
    console.error(`Failed to reassign travel authorization: ${error}`, { error })
    snack.error(`Failed to reassign travel authorization: ${error}`)
  }
}

async function approveExpenseClaim() {
  try {
    await travelAuthorizationApi.approveExpenseClaim(props.travelAuthorizationId)
    snack.success("Expense claim approved!")
    emit("approved", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to approve expense claim: ${error}`, { error })
    snack.error(`Failed to approve expense claim: ${error}`)
  }
}

async function denyExpenseClaim() {
  try {
    await travelAuthorizationApi.denyExpenseClaim(props.travelAuthorizationId)
    snack.success("Expense claim denied!")
    emit("denied", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to deny expense claim: ${error}`, { error })
    snack.error(`Failed to deny expense claim: ${error}`)
  }
}
</script>
