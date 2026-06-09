<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="close"
    @update:model-value="closeIfFalse"
  >
    <HeaderActionsFormCard
      ref="formCardRef"
      title="Send Back to Traveler"
      @submit.prevent="sendBackToTravellerAndClose"
    >
      <v-textarea
        v-model="requestChange"
        label="Reason for changes *"
        placeholder="Please explain what changes are needed..."
        variant="outlined"
        rows="4"
        :rules="[required]"
        @keydown.ctrl.enter="sendBackToTravellerAndClose"
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
  sentBackToTraveller: [travelAuthorizationId: number]
}>()

const travelAuthorizationId = useRouteQuery<string | undefined, number | undefined>(
  "showSendBackToTraveller",
  undefined,
  {
    transform: integerTransformer,
  }
)

const showDialog = ref(false)
const requestChange = ref("")

watch(
  travelAuthorizationId,
  (newId) => {
    if (isNil(newId)) {
      showDialog.value = false
      requestChange.value = ""
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

async function sendBackToTravellerAndClose() {
  if (isNil(travelAuthorizationId.value)) return

  if (isNil(formCardRef.value)) return

  const { valid } = await formCardRef.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isSubmitting.value = true
  try {
    await travelAuthorizationsApi.sendBackToTraveller(travelAuthorizationId.value, {
      requestChange: requestChange.value,
    })
    snack.success("Expense claim sent back to traveller!")
    close()

    await nextTick()
    emit("sentBackToTraveller", travelAuthorizationId.value)
  } catch (error) {
    console.error(`Failed to send expense claim back to traveller: ${error}`, { error })
    snack.error(`Failed to send expense claim back to traveller: ${error}`)
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
