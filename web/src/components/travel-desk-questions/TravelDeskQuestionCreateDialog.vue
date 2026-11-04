<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="hide"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        color="primary"
        v-bind="activatorProps"
      >
        Add Question
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndHide"
    >
      <v-card>
        <v-card-title>
          <h2>Add Question</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <!-- TODO: make this a component -->
              <RequestTypeSelect
                v-model="travelDeskQuestion.requestType"
                :rules="[required]"
                label="Request Type *"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="travelDeskQuestion.question"
                :rules="[required]"
                label="Question *"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            variant="outlined"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Create Question
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { cloneDeep, isNil } from "lodash"

import { required } from "@/utils/validators"

import travelDeskQuestionsApi, { type TravelDeskQuestion } from "@/api/travel-desk-questions-api"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import RequestTypeSelect from "@/components/travel-desk-questions/RequestTypeSelect.vue"

const props = withDefaults(
  defineProps<{
    attributes?: Partial<TravelDeskQuestion>
  }>(),
  {
    attributes: () => ({}),
  }
)

const emit = defineEmits<{
  created: [questionId: number]
}>()

const travelDeskQuestion = ref<Partial<TravelDeskQuestion>>(cloneDeep(props.attributes))

const snack = useSnack()

const showDialog = useRouteQuery<string, boolean>("showTravelDeskQuestionCreate", "false", {
  transform: booleanTransformer,
})

const form = useTemplateRef("form")
const isLoading = ref(false)

function hide() {
  showDialog.value = false
  resetQuestion()
  form.value?.resetValidation()
}

async function createAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    const { travelDeskQuestion: newTravelDeskQuestion } = await travelDeskQuestionsApi.create(
      travelDeskQuestion.value
    )
    emit("created", newTravelDeskQuestion.id)
    snack.success("Question created successfully")
    hide()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to create travel desk question: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function resetQuestion() {
  travelDeskQuestion.value = cloneDeep(props.attributes)
}
</script>

<style scoped></style>
