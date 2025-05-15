<template>
  <HeaderActionsCard
    title="Edit Trip Details (Estimated)"
    class="mt-4"
  >
    <TripDetailsEstimatesEditForm
      ref="tripDetailsEstimatesEditForm"
      :travel-authorization-id="travelAuthorizationIdAsNumber"
      v-on="$listeners"
    />
    <template #actions>
      <v-btn
        color="primary"
        :loading="isLoading"
        @click="validateSaveAndReturn"
      >
        Save
      </v-btn>
      <v-btn
        color="primary"
        outlined
        :to="{
          name: 'travel-requests/TravelRequestDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
        >Cancel</v-btn
      >
    </template>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof TripDetailsEstimatesEditForm> | null>} */
const tripDetailsEstimatesEditForm = ref(null)
const snack = useSnack()
const router = useRouter()

async function validateSaveAndReturn() {
  if (isNil(tripDetailsEstimatesEditForm.value)) return
  if (!tripDetailsEstimatesEditForm.value.validate()) {
    snack.error("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    await tripDetailsEstimatesEditForm.value.save()
    snack.success("Travel request saved.")
    emit("updated", props.travelAuthorizationId)
    return router.push({
      name: "travel-requests/TravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  } catch (error) {
    console.error(`Failed to save travel request: ${error}`, { error })
    snack.error(`Failed to save travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs([
  {
    text: "Travel Requests",
    to: {
      name: "TravelRequests",
    },
  },
  {
    text: "Details",
    to: {
      name: "travel-requests/TravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
  {
    text: "Edit Trip Details (Estimates)",
    to: {
      name: "travel-requests/TravelRequestEditTripDetailsEstimatesPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
</script>
