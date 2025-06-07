<template>
  <div>
    <v-row>
      <v-col>
        <PurposeCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DetailsCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsEditFormCard
          ref="approvalsEditFormCard"
          :travel-authorization-id="travelAuthorizationId"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from "vue"

import useSnack from "@/use/use-snack"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsEditFormCard from "@/components/travel-authorizations/ApprovalsEditFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updated"])

async function initialize(context) {
  context.setEditableSteps(["edit-purpose-details", "edit-trip-details", "generate-estimate"])
}

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof ApprovalsEditFormCard> | null>} */
const approvalsEditFormCard = ref(null)
const snack = useSnack()

async function validateAndSave() {
  isLoading.value = true
  try {
    if (approvalsEditFormCard.value.validate() === false) {
      snack.error("Please fill in all required fields.")
      return false
    }

    await approvalsEditFormCard.value.submit()
    snack.success("Travel request submitted.")
    emit("updated", props.travelAuthorizationId)
    return true
  } catch (error) {
    console.error(`Failed to submit travel request: ${error}`, { error })
    snack.error(`Failed to submit travel request: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  initialize,
  continue: validateAndSave,
})
</script>
