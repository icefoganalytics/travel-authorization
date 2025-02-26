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
    <template #top>
      <TravelDeskQuestionEditDialog
        ref="travelDeskQuestionEditDialog"
        @saved="refresh"
      />
    </template>

    <template #item.requestType="{ value }">
      {{ t(`travel_desk_question.request_type.${value}`, { $default: value }) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        title="Edit"
        icon
        color="blue"
        @click="showEditDialog(item.id)"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        :loading="isDeleting"
        title="Delete"
        icon
        color="red"
        @click="deleteQuestion(item.id)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import { useI18n } from "@/plugins/vue-i18n-plugin"

import travelDeskQuestionsApi from "@/api/travel-desk-questions-api"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTravelDeskQuestions from "@/use/use-travel-desk-questions"
import TravelDeskQuestionEditDialog from "@/components/travel-desk-questions/TravelDeskQuestionEditDialog.vue"

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
  {
    text: "Actions",
    value: "actions",
    align: "end",
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

const travelDeskQuestionEditDialog = ref(null)

function showEditDialog(questionId) {
  travelDeskQuestionEditDialog.value.show(questionId)
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteQuestion(questionId) {
  if (!blockedToTrueConfirm("Are you sure you want to delete this question?")) return

  isDeleting.value = true
  try {
    await travelDeskQuestionsApi.delete(questionId)
    snack.success("Question deleted successfully")
    await refresh()
  } catch (error) {
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  refresh,
})
</script>
