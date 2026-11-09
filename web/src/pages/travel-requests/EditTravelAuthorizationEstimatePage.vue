<template>
  <div>
    TODO: Build out estimate page for travel authorization.
    <pre>
      {{ travelAuthorization }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"

import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const { travelAuthorizationId } = toRefs(props)
const travelAuthorizationIdAsNumber = computed(() => parseInt(travelAuthorizationId.value))
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationIdAsNumber)
</script>
