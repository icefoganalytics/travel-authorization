<template>
  <v-form ref="formRef">
    <input
      ref="fileInputRef"
      class="d-none"
      type="file"
      :rules="[required]"
      required
      @change="uploadFileAndEmit"
    />
    <v-btn
      color="primary"
      :loading="isLoading"
      v-bind="buttonProps"
      @click="triggerFileInput"
    >
      Add Receipt
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { ref, useTemplateRef } from "vue"

import { type VBtn } from "vuetify/components"

import { required } from "@/utils/validators"
import { expenses } from "@/api"
import useSnack from "@/use/use-snack"

type VBtnProps = VBtn["$props"]

const props = defineProps<{
  expenseId: number
  buttonProps?: VBtnProps
}>()

const emit = defineEmits<{
  uploaded: [void]
}>()

const formRef = useTemplateRef("formRef")
const fileInputRef = useTemplateRef("fileInputRef")
const isLoading = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

const snack = useSnack()

async function uploadFileAndEmit(event: Event) {
  if (isNil(formRef.value)) return

  const { valid } = await formRef.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  const target = event.target as HTMLInputElement
  const { files } = target
  if (isNil(files) || isEmpty(files)) return

  const file = files[0]

  isLoading.value = true
  try {
    await expenses.receiptApi.create(props.expenseId, file)

    emit("uploaded")
    snack.success("Receipt uploaded!")
  } catch (error) {
    console.error(`Failed to upload receipt: ${error}`, { error })
    snack.error(`Failed to upload receipt: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
