<template>
  <div>
    <div class="d-flex flex-column flex-md-row">
      <StateStepper
        :steps="steps"
        :current-step-number="currentStepNumber"
        @update:currentStepNumber="goToStep"
      />
      <div class="ml-md-2">
        <div class="d-flex justify-space-between align-baseline my-5 ml-md-4">
          <h2 class="mb-0">
            Travel -
            <UserChipMenu :user-id="currentUser.id" />
          </h2>
        </div>

        <v-card class="default">
          <v-card-text>
            <SummaryHeaderPanel
              ref="summaryHeaderPanel"
              :travel-authorization-id="travelAuthorizationIdAsNumber"
              class="mt-5"
            />

            <router-view
              ref="currentStepComponent"
              @updated="refreshHeaderAndLocalState"
            ></router-view>

            <div class="d-flex flex-column flex-md-row justify-md-end">
              <v-btn
                v-bind="{
                  color: 'secondary',
                  ...currentStep.backButtonProps,
                }"
                @click="backAndGoToPreviousStep"
              >
                {{ currentStep.backButtonText || "Back" }}
              </v-btn>
              <v-btn
                class="ml-0 ml-md-3"
                v-bind="{
                  color: 'primary',
                  ...currentStep.continueButtonProps,
                  loading: isLoading,
                }"
                @click="continueAndGoToNextStep"
              >
                {{ currentStep.continueButtonText || "Continue" }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-row class="mt-md-10 mt-5">
      <v-col>
        <TravelAuthorizationActionLogsTable
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, toRefs } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import useCurrentUser from "@/use/use-current-user"

import UserChipMenu from "@/components/users/UserChipMenu.vue"
import StateStepper from "@/components/common/wizards/StateStepper.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/modules/travel-authorizations/components/TravelAuthorizationActionLogsTable.vue"
import useMyTravelRequestWizard from "@/use/wizards/use-my-travel-authorization-wizard"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const { currentUser } = useCurrentUser()

const { travelAuthorizationId } = toRefs(props)
const {
  currentStepNumber,
  steps,
  currentStep,
  isLoading,
  isReady,
  refresh,
  goToStep,
  goToNextStep,
  goToPreviousStep,
} = useMyTravelRequestWizard(travelAuthorizationId)

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  await isReady()

  const step = steps.value.find((step) => step.to?.name === route.name)
  if (!isNil(step) && step.number !== currentStepNumber.value) {
    return goToStep(step.number)
  } else if (currentStep.value.to && currentStep.value.to.name !== route.name) {
    await router.push(currentStep.value.to)
  }
})

const currentStepComponent = ref(null)

async function backAndGoToPreviousStep() {
  if (isNil(currentStepComponent.value?.back)) {
    return goToPreviousStep()
  }

  isLoading.value = true
  try {
    const stepSuccess = await currentStepComponent.value?.back()
    if (stepSuccess !== true) {
      return
    }
    return goToPreviousStep()
  } finally {
    isLoading.value = false
  }
}

async function continueAndGoToNextStep() {
  if (isNil(currentStepComponent.value?.continue)) {
    return goToNextStep()
  }

  isLoading.value = true
  try {
    const stepSuccess = await currentStepComponent.value?.continue()
    if (stepSuccess !== true) {
      return
    }
    return goToNextStep()
  } finally {
    isLoading.value = false
  }
}

/** @type {Ref<InstanceType<typeof SummaryHeaderPanel> | null>} */
const summaryHeaderPanel = ref(null)

async function refreshHeaderAndLocalState() {
  await Promise.all([summaryHeaderPanel.value?.refresh(), refresh()])
}
</script>
