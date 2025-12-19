<template>
  <v-btn
    :loading="isLoading"
    :color="color"
    @click="createAndGoToEditPage"
  >
    New Travel Request
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"

import {
  TravelSegmentAccommodationTypes,
  TravelSegmentTravelMethods,
} from "@/api/travel-segments-api"
import travelAuthorizationsApi, {
  TravelAuthorizationStatuses,
} from "@/api/travel-authorizations-api"

import useCurrentUser from "@/use/use-current-user"
import { FIRST_STEP_ID } from "@/use/wizards/my-travel-request-wizard-steps"

withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: "primary",
  }
)

const { currentUser } = useCurrentUser<true>()

const isLoading = ref(false)
const router = useRouter()
const snack = useSnack()

async function createAndGoToEditPage() {
  isLoading.value = true
  try {
    const { travelAuthorization } = await travelAuthorizationsApi.create({
      userId: currentUser.value.id,
      wizardStepName: FIRST_STEP_ID,
      status: TravelAuthorizationStatuses.DRAFT,
      travelSegmentEstimatesAttributes: [
        {
          isActual: false,
          segmentNumber: 1,
          modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
          accommodationType: TravelSegmentAccommodationTypes.HOTEL,
        },
        {
          isActual: false,
          segmentNumber: 2,
          modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
          accommodationType: null,
        },
      ],
    })
    if (isNil(travelAuthorization.wizardStepName)) {
      throw new Error("Travel authorization created but wizard step name is missing.")
    }

    snack.success("Travel request created!")
    return router.push({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorization.id.toString(),
        stepName: travelAuthorization.wizardStepName,
      },
    })
  } catch (error) {
    console.error(error)
    snack.error(`Failed to create travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
