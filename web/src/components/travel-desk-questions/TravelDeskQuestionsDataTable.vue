<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :headers="headers"
    :items="travelDeskQuestions"
    :loading="isLoading"
    :server-items-length="totalCount"
    :footer-props="{
      'items-per-page-options': [defaultPerPage, 10, 15, -1],
    }"
    disable-sort
  >
    <template #item.requestType="{ value }">
      {{ t(`travel_desk_question.request_type.${value}`, { $default: value }) }}
    </template>
  </v-data-table>
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
    text: "Request Type",
    value: "requestType",
  },
  {
    text: "Question",
    value: "question",
  },
  {
    text: "Response",
    value: "response",
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
