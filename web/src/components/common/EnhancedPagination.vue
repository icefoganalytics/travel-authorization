<template>
  <v-pagination
    v-model="page"
    :length="totalPages"
    :density="isExtraSmallDisplay ? 'compact' : 'default'"
  />
</template>

<script lang="ts">
/** Use with the useRouteQueryPagination composable. */
</script>

<script setup lang="ts">
import { computed } from "vue"
import { useDisplay } from "vuetify"

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

const { xs: isExtraSmallDisplay } = useDisplay()

const totalPages = computed(() => Math.ceil(props.totalCount / perPage.value))
</script>
