<template>
  <div>
    <title-card class="mt-10">
      <template #title>
        <div>Question</div>
      </template>
      <template #body>
        <v-row class="mt-3 mb-0 mx-0">
          <v-col cols="8">
            <v-select
              v-model="question.requestType"
              :readonly="!travelDeskUser || readonly"
              :items="questionList"
              label="About"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row class="my-n10 mx-0">
          <v-col cols="12">
            <v-text-field
              v-model="question.question"
              :readonly="!travelDeskUser || readonly"
              :error="question.state?.questionErr ?? false"
              label="Question"
              variant="outlined"
              @input="
                question.state = {
                  ...question.state,
                  questionErr: question.state?.questionErr ?? false,
                }
              "
            />
          </v-col>
        </v-row>

        <v-row class="my-n5 mx-0">
          <v-col cols="12">
            <v-text-field
              v-model="question.response"
              :readonly="readonly"
              :error="question.state?.responseErr ?? false"
              label="Response"
              variant="outlined"
              @input="
                question.state = {
                  ...question.state,
                  questionErr: question.state?.responseErr ?? false,
                }
              "
            />
          </v-col>
        </v-row>
      </template>
    </title-card>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n"

import { TRAVEL_DESK_QUESTION_REQUEST_TYPES } from "@/api/travel-desk-questions-api"

import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"

defineProps({
  question: {
    type: Object,
    required: true,
  },
  readonly: { type: Boolean, default: false },
  travelDeskUser: { type: Boolean, default: false },
})

const { t } = useI18n()

const questionList = Object.values(TRAVEL_DESK_QUESTION_REQUEST_TYPES).map((requestType) => ({
  text: t(`travel_desk_question.request_type.${requestType}`, requestType),
  value: requestType,
}))
</script>

<style scoped></style>
