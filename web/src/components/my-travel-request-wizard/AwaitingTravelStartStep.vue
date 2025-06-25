<template>
  <v-card>
    <v-card-title>
      <h2>Awaiting Travel Start</h2>
    </v-card-title>

    <v-card-text>
      <p>Waiting for the departure date to have passed.</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, nextTick, toRefs } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  refresh,
  isReady: isReadyTravelAuthorization,
} = useTravelAuthorization(travelAuthorizationId)

const isBeforeTravelStartDate = computed(() => {
  const firstTravelSegment = travelAuthorization.value?.travelSegments?.[0]
  if (isNil(firstTravelSegment)) return false

  return new Date(firstTravelSegment.departureOn) > new Date()
})

const canContinue = computed(() => {
  return !isBeforeTravelStartDate.value
})

async function initialize(context) {
  context.setEditableSteps([])

  await isReadyTravelAuthorization()
  await nextTick()
  if (canContinue.value) {
    context.goToNextStep()
    emit("updated", props.travelAuthorizationId)
  }
}

const snack = useSnack()

async function checkTravelStartStatus() {
  try {
    await refresh()

    await nextTick()
    if (canContinue.value) {
      snack.info("Travel has started!")
      return true
    }

    if (isBeforeTravelStartDate.value) {
      snack.warning("Travel has not started yet.")
    }
    return false
  } catch (error) {
    console.error(`Error checking travel start status: ${error}`)
    snack.error(`Error checking travel start status: ${error}`)
    return false
  }
}

defineExpose({
  initialize,
  continue: checkTravelStartStatus,
})
</script>
