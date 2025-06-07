<template>
  <PurposeEditFormCard
    ref="purposeEditFormCard"
    :travel-authorization-id="travelAuthorizationId"
    v-on="$listeners"
  />
</template>

<script setup>
import { ref } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"

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
  if (isNil(purposeEditFormCard.value)) return false
  if (!purposeEditFormCard.value.validate()) {
    snack.error("Please fill in all required fields.")
    return false
  }

  isLoading.value = true
  try {
    await purposeEditFormCard.value.save()
    snack.success("Travel request saved.")
    emit("updated", props.travelAuthorizationId)
    return true
  } catch (error) {
    console.error(`Failed to save travel request: ${error}`, { error })
    snack.error(`Failed to save travel request: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  continue: validateAndSave,
})
</script>
