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
    <template #top>
      <TravelDeskQuestionEditDialog
        ref="travelDeskQuestionEditDialog"
        @saved="refresh"
      />
    </template>

    <template #item.requestType="{ value }">
      {{ t(`travel_desk_question.request_type.${value}`, value) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        title="Edit"
        icon
        size="small"
        color="blue"
        @click="showEditDialog(item.id)"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        :loading="isDeleting"
        title="Delete"
        icon
        size="small"
        color="red"
        @click="deleteQuestion(item.id)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import travelDeskQuestionsApi from "@/api/travel-desk-questions-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
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
  {
    title: "Actions",
    key: "actions",
    align: "end" as const,
  },
]

const { t } = useI18n()

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const defaultPerPageAsString = computed(() => String(props.defaultPerPage))
const perPage = useRouteQuery<string, number>(
  `perPage${props.routeQuerySuffix}`,
  defaultPerPageAsString,
  {
    transform: integerTransformer,
  }
)
const travelDeskQuestionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskQuestions, totalCount, isLoading, refresh } =
  useTravelDeskQuestions(travelDeskQuestionsQuery)

const travelDeskQuestionEditDialog = useTemplateRef("travelDeskQuestionEditDialog")

function showEditDialog(questionId: number) {
  travelDeskQuestionEditDialog.value?.show(questionId)
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteQuestion(questionId: number) {
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
