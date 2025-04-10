<template>
  <v-combobox
    :value="value"
    :items="emails"
    :loading="loading"
    :rules="emailRules"
    :return-object="false"
    clearable
    persistent-hint
    v-bind="$attrs"
    @input="onInput"
    @update:search-input="debouncedSearch"
  ></v-combobox>
</template>

<script>
import { debounce } from "lodash"

import usersApi from "@/api/users-api"

function isValidEmail(v) {
  return (
    /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()\\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      v
    ) || "E-mail must be valid"
  )
}

export default {
  name: "UserEmailSearchableCombobox",
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    emails: [],
    potentialInput: "",
    loading: false,
  }),
  computed: {
    emailRules() {
      return [...this.rules, isValidEmail]
    },
    debouncedSearch() {
      return debounce((token) => {
        this.$emit("input", token)
        return this.search(token)
      }, 300)
    },
  },
  methods: {
    search(token) {
      this.potentialInput = token
      this.loading = true
      return usersApi
        .search({ email: token })
        .then(({ emails }) => {
          this.emails = emails
        })
        .catch((error) => {
          console.error(error)
          this.emails = []
        })
        .finally(() => {
          this.loading = false
        })
    },
    onInput(value) {
      this.potentialInput = value
      this.$emit("input", value)
    },
  },
}
</script>
