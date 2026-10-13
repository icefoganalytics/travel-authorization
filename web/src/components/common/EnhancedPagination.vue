<template>
  <v-pagination
    v-model="page"
    :length="totalPages"
  />
</template>

<script lang="ts">
/** Use with the useRouteQueryPagination composable. */
</script>

<script setup lang="ts">
import { computed } from "vue"

const page = defineModel<number>({
  required: true,
  default: 1,
})

const perPage = defineModel<number>("perPage", {
  default: 10,
})

const props = defineProps<{
  totalCount: number
}>()

const totalPages = computed(() => Math.ceil(props.totalCount / perPage.value))
</script>
