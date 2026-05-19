<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskTravelRequest)"
    type="card"
  />
  <v-card v-else>
    <v-card-title>
      <h2>Travel Desk Request</h2>
    </v-card-title>
    <v-card-text>
      <TravelerDetailsFormCard
        ref="travelerDetailsFormCard"
        v-model="travelDeskTravelRequest"
        class="mt-4"
        @save-requested="saveAndNotify"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"

import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  updated: [travelAuthorizationId: number]
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const travelDeskTravelRequestId = computed(() => {
  return travelAuthorization.value?.travelDeskTravelRequest?.id
})
const { travelDeskTravelRequest, save } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const travelerDetailsFormCard = useTemplateRef("travelerDetailsFormCard")
const snack = useSnack()

async function saveAndNotify() {
  if (isNil(travelerDetailsFormCard.value)) return false

  const { valid } = await travelerDetailsFormCard.value.validate()
  if (!valid) {
    snack("Form validation failed! Please fill out all required fields.", {
      color: "error",
    })
    return false
  }

  try {
    await save()
    snack.success("Request updated.")
    emit("updated", props.travelAuthorizationId)
    return true
  } catch (error) {
    snack.error(`Failed to save request: ${error}`)
    return false
  }
}

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([])
}

defineExpose({
  initialize,
  continue: saveAndNotify,
})
</script>
