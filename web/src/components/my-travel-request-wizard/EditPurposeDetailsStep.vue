<template>
  <PurposeEditFormCard
    ref="purposeEditFormCard"
    :travel-authorization-id="travelAuthorizationId"
    v-on="$listeners"
  />
</template>

<script setup>
import { ref } from "vue"

import { useSnack } from "@/plugins/snack-plugin"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof PurposeEditFormCard> | null>} */
const purposeEditFormCard = ref(null)
const snack = useSnack()

async function validateAndSave() {
  isLoading.value = true
  try {
    if (purposeEditFormCard.value.validate() === false) {
      snack.error("Please fill in all required fields.")
      return false
    }

    await purposeEditFormCard.value.save()
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
  continue: validateAndSave,
})
</script>
