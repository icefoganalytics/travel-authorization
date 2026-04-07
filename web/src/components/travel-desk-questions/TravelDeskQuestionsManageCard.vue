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
          @created="refresh"
        />
      </div>
      <TravelDeskQuestionsEditDataTableServer
        ref="travelDeskQuestionsEditDataTable"
        :where="{
          travelRequestId: travelDeskTravelRequestId,
        }"
        route-query-suffix="TravelDeskQuestion"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

import TravelDeskQuestionCreateDialog from "@/components/travel-desk-questions/TravelDeskQuestionCreateDialog.vue"
import TravelDeskQuestionsEditDataTableServer from "@/components/travel-desk-questions/TravelDeskQuestionsEditDataTableServer.vue"

defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskQuestionsEditDataTableServer> | null>} */
const travelDeskQuestionsEditDataTable = ref(null)

function refresh() {
  travelDeskQuestionsEditDataTable.value?.refresh()
}
</script>
