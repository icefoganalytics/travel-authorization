<template>
  <div>
    TODO: Build out estimate page for travel authorization.
    <pre>
      {{ travelAuthorization }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationIdAsNumber)
</script>
