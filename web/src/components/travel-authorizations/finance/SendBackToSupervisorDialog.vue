<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="close"
    @update:model-value="closeIfFalse"
  >
    <HeaderActionsFormCard
      ref="formCardRef"
      title="Send Back to Supervisor"
      @submit.prevent="sendBackToSupervisorAndClose"
    >
      <v-textarea
        v-model="sendbackReason"
        label="Reason *"
        placeholder="Please explain why this travel request is being sent back to the supervisor..."
        variant="outlined"
        rows="4"
        :rules="[required]"
        @keydown.ctrl.enter="sendBackToSupervisorAndClose"
      />

      <template #actions>
        <v-btn
          color="warning"
          :loading="isSubmitting"
          type="submit"
        >
          Send Back
        </v-btn>
        <v-btn
          variant="outlined"
          :loading="isSubmitting"
          @click="close"
        >
          Cancel
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const emit = defineEmits<{
  sentBackToSupervisor: [travelAuthorizationId: number]
}>()

const travelAuthorizationId = useRouteQuery<string | undefined, number | undefined>(
  "showSendBackToSupervisor",
  undefined,
  {
    transform: integerTransformer,
  }
)

const showDialog = ref(false)
const sendbackReason = ref("")

watch(
  travelAuthorizationId,
  (newId) => {
    if (isNil(newId)) {
      showDialog.value = false
      sendbackReason.value = ""
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const isSubmitting = ref(false)
const formCardRef = useTemplateRef("formCardRef")
const snack = useSnack()

async function sendBackToSupervisorAndClose() {
  if (isNil(travelAuthorizationId.value)) return

  if (isNil(formCardRef.value)) return

  const { valid } = await formCardRef.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isSubmitting.value = true
  try {
    await travelAuthorizationsApi.sendBackToSupervisor(travelAuthorizationId.value, {
      sendbackReason: sendbackReason.value,
    })
    snack.success("Expense claim sent back to supervisor!")
    close()

    await nextTick()
    emit("sentBackToSupervisor", travelAuthorizationId.value)
  } catch (error) {
    console.error(`Failed to send expense claim back to supervisor: ${error}`, { error })
    snack.error(`Failed to send expense claim back to supervisor: ${error}`)
  } finally {
    isSubmitting.value = false
  }
}

function open(id: number) {
  travelAuthorizationId.value = id
}

function close() {
  travelAuthorizationId.value = undefined
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) return

  close()
}

defineExpose({
  open,
})
</script>
