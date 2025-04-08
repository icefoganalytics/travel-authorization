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
        :is-saving="isLoading"
        class="mt-4"
        @save-requested="saveAndNotify"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { useSnack } from "@/plugins/snack-plugin"

import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const travelDeskTravelRequestId = computed(() => {
  return travelAuthorization.value?.travelDeskTravelRequest?.id
})
const { travelDeskTravelRequest, isLoading, save } =
  useTravelDeskTravelRequest(travelDeskTravelRequestId)

/** @type {import("vue").Ref<InstanceType<typeof TravelerDetailsFormCard> | null>} */
const travelerDetailsFormCard = ref(null)

const snack = useSnack()

async function saveAndNotify() {
  if (travelerDetailsFormCard.value.validate() !== true) {
    snack("Form validation failed! Please fill out all required fields.", {
      color: "error",
    })
    return false
  }

  try {
    await save()
    snack.success("Request updated.")
    emit("updated", travelAuthorization.value.id)
    return true
  } catch (error) {
    snack.error(`Failed to save request: ${error}`)
    return false
  }
}

async function initialize(context) {
  context.setEditableSteps([])
}

defineExpose({
  initialize,
  continue: saveAndNotify,
})
</script>
