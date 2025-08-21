<template>
  <v-form ref="formRef">
    <input
      ref="fileInputRef"
      class="d-none"
      type="file"
      accept="image/*"
      :rules="[required]"
      required
      @change="uploadFileAndEmit"
    />
    <v-btn
      color="primary"
      :loading="isLoading"
      @click="triggerFileInput"
    >
      Add Receipt
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { ref } from "vue"

import { type VForm } from "vuetify/lib/components"

import { required } from "@/utils/validators"
import { expenses } from "@/api"
import useSnack from "@/use/use-snack"

const props = defineProps<{
  expenseId: number
}>()

// TODO: switch to `uploaded: [void]` syntax in vue 3
const emit = defineEmits<{
  (event: "uploaded"): void
}>()

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

const snack = useSnack()

async function uploadFileAndEmit(event: Event) {
  if (isNil(formRef.value)) return
  if (!formRef.value.validate()) return

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
