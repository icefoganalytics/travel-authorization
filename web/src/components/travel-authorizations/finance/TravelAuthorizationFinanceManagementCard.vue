<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <v-card v-else>
    <v-form ref="form">
      <v-card-text>
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
              Send to User
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
              Send to Supervisor
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import useSnack from "@/use/use-snack"
import travelAuthorizationsApi from "@/api/travel-authorizations-api"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits(["approved", "denied"])

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

async function sendBackToTraveler() {
  snack.warning("Send back to user — not yet implemented.")
}

async function sendBackToSupervisor() {
  snack.warning("Send back to supervisor — not yet implemented.")
}
</script>
