<template>
  <v-card class="card--outlined">
    <v-card-title>
      <h3>Questions</h3>
    </v-card-title>
    <v-card-text>
      <div class="d-flex justify-end">
        <TravelDeskQuestionCreateDialog
          :attributes="{
            travelRequestId: travelDeskTravelRequestId,
          }"
          @created="refreshAndEmitUpdated"
        />
      </div>
      <TravelDeskQuestionsEditDataTableServer
        ref="travelDeskQuestionsEditDataTable"
        :where="{
          travelRequestId: travelDeskTravelRequestId,
        }"
        route-query-suffix="TravelDeskQuestion"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import TravelDeskQuestionCreateDialog from "@/components/travel-desk-questions/TravelDeskQuestionCreateDialog.vue"
import TravelDeskQuestionsEditDataTableServer from "@/components/travel-desk-questions/TravelDeskQuestionsEditDataTableServer.vue"

defineProps<{
  travelDeskTravelRequestId: number
}>()
const emit = defineEmits<{
  updated: []
}>()
const travelDeskQuestionsEditDataTable = useTemplateRef("travelDeskQuestionsEditDataTable")

async function refresh() {
  await travelDeskQuestionsEditDataTable.value?.refresh()
}

async function refreshAndEmitUpdated() {
  await refresh()
  emit("updated")
}

defineExpose({
  refresh,
})
</script>
