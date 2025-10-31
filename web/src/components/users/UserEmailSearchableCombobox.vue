<template>
  <v-combobox
    :value="value"
    :items="emails"
    :loading="isLoading"
    :rules="emailRules"
    :return-object="false"
    clearable
    persistent-hint
    v-bind="$attrs"
    @input="emitUpdateAndInput"
    @update:search-input="debouncedSearch"
  ></v-combobox>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { debounce } from "lodash"
import { ref, computed } from "vue"

import usersApi from "@/api/users-api"

const props = withDefaults(
  defineProps<{
    value?: string | null
    rules?: ((v: unknown) => boolean | string)[]
  }>(),
  {
    value: null,
    rules: () => [],
  }
)

const emit = defineEmits<{
  (event: "input", value: string): void
}>()

const emailRules = computed(() => [...props.rules, isValidEmail])

const searchToken = ref("")
const isLoading = ref(false)
const emails = ref<string[]>([])

async function search(token: string) {
  searchToken.value = token
  isLoading.value = true
  try {
    // TODO: udpate to use usersApi.list({ filters: { search: token }})
    const { emails: newEmails } = await usersApi.search({ email: token })
    emails.value = newEmails
  } catch (error) {
    console.error(error)
    emails.value = []
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = debounce(search, 300)

function emitUpdateAndInput(value: string) {
  searchToken.value = value
  emit("input", value)
}

function isValidEmail(v: string) {
  return (
    /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      v
    ) || "E-mail must be valid"
  )
}
</script>
