<template>
  <DetailsEditFormCard
    ref="detailsEditFormCard"
    :travel-authorization-id="travelAuthorizationId"
    v-on="$listeners"
  />
</template>

<script setup>
import { ref } from "vue"

import { useSnack } from "@/plugins/snack-plugin"

import DetailsEditFormCard from "@/components/travel-authorizations/DetailsEditFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updated"])

async function initialize(context) {
  context.setEditableSteps(["edit-purpose-details"])
}

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof DetailsEditFormCard> | null>} */
const detailsEditFormCard = ref(null)
const snack = useSnack()

async function validateAndSave() {
  isLoading.value = true
  try {
    if (detailsEditFormCard.value.validate() === false) {
      snack.error("Please fill in all required fields.")
      return false
    }

    await detailsEditFormCard.value.save()
    snack.success("Travel request saved.")
    emit("updated", props.travelAuthorizationId)
    return true
  } catch (error) {
    snack.error(error.message)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  initialize,
  continue: validateAndSave,
})
</script>
