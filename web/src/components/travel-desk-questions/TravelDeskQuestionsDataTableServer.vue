<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    :headers="headers"
    :items="travelDeskQuestions"
    :loading="isLoading"
    :items-length="totalCount"
    :footer-props="{
      'items-per-page-options': [defaultPerPage, 10, 15, -1],
    }"
    disable-sort
  >
    <template #item.requestType="{ value }">
      {{ t(`travel_desk_question.request_type.${value}`, value) }}
    </template>
  </v-data-table-server>
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useTravelDeskQuestions from "@/use/use-travel-desk-questions"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  defaultPerPage: {
    type: Number,
    default: 3,
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
})

const headers = [
  {
    title: "Request Type",
    key: "requestType",
  },
  {
    title: "Question",
    key: "question",
  },
  {
    title: "Response",
    key: "response",
  },
]

const { t } = useI18n()

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformerLegacy,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, props.defaultPerPage, {
  transform: integerTransformerLegacy,
})

const travelDeskQuestionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskQuestions, totalCount, isLoading, refresh } =
  useTravelDeskQuestions(travelDeskQuestionsQuery)

defineExpose({
  refresh,
})
</script>
