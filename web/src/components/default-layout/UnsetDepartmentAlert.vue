<template>
  <v-alert
    v-if="isCurrentUserDepartmentUnset"
    type="error"
  >
    Your department details are missing. Please contact your system administrator to update your
    information.
  </v-alert>
</template>

<script setup>
import { computed } from "vue"
import { isNil, isEmpty } from "lodash"

import useCurrentUser from "@/use/use-current-user"

const { currentUser } = useCurrentUser()

const isCurrentUserDepartmentUnset = computed(() => {
  const { department } = currentUser.value

  return isNil(department) || isEmpty(department)
})
</script>
