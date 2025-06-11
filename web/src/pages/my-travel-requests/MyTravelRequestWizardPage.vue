<template>
  <div>
    <div class="d-flex flex-column flex-md-row">
      <StateStepper
        class="flex-shrink-0"
        :steps="steps"
        :current-wizard-step-name="currentWizardStepName"
        @update:currentWizardStepName="goToStep"
      />
      <div class="ml-md-2 flex-grow-1">
        <v-card class="default">
          <v-card-text>
            <SummaryHeaderPanel
              ref="summaryHeaderPanel"
              :travel-authorization-id="travelAuthorizationIdAsNumber"
              class="mb-5"
            />

            <v-skeleton-loader
              v-if="isNil(currentStep.component)"
              type="card"
            />
            <component
              :is="currentStep.component"
              v-else
              ref="currentStepComponent"
              :travel-authorization-id="travelAuthorizationIdAsNumber"
              :step-title="currentStep.title"
              :step-subtitle="currentStep.subtitle"
              @update:travelPurposeId="
                updateTravelAuthorizationSummary({
                  travelPurposeId: $event,
                })
              "
              @update:finalDestinationLocationId="
                updateTravelAuthorizationSummary({
                  finalDestinationLocationId: $event,
                })
              "
              @update:departureDate="
                updateTravelAuthorizationSummary({
                  departureDate: $event,
                })
              "
              @update:returnDate="
                updateTravelAuthorizationSummary({
                  returnDate: $event,
                })
              "
              @updated="refreshHeaderAndLocalState"
            />

            <div class="d-flex flex-column flex-md-row">
              <ConditionalTooltipButton
                ref="continueButton"
                v-bind="{
                  color: 'primary',
                  tooltipText: 'Continue',
                  ...currentStep.continueButtonProps,
                  loading: isLoading,
                }"
                @click="continueAndGoToNextStep"
              >
                {{ currentStep.continueButtonText || "Continue" }}
              </ConditionalTooltipButton>
              <ConditionalTooltipButton
                class="ml-0 ml-md-3"
                v-bind="{
                  color: 'secondary',
                  tooltipText: 'Not available',
                  ...currentStep.backButtonProps,
                }"
                @click="backAndGoToPreviousStep"
              >
                {{ currentStep.backButtonText || "Back" }}
              </ConditionalTooltipButton>
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
import { computed, ref, watch } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil, isEmpty, isString } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useMyTravelRequestWizard from "@/use/wizards/use-my-travel-request-wizard"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import StateStepper from "@/components/common/wizards/StateStepper.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
  stepName: {
    type: String,
    default: null,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const {
  currentWizardStepName,
  steps,
  currentStep,
  isLoading,
  refresh,
  goToStep,
  goToNextStep,
  goToPreviousStep,
  setEditableSteps,
  setBackButtonProps,
  setContinueButtonProps,
} = useMyTravelRequestWizard(travelAuthorizationIdAsNumber)

const router = useRouter()

watch(
  () => currentWizardStepName.value,
  (newCurrentWizardStepName) => {
    if (newCurrentWizardStepName === props.stepName) return

    router.replace({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber.value,
        stepName: newCurrentWizardStepName,
      },
    })
  }
)

const currentStepComponent = ref(null)

watch(
  () => currentStepComponent.value,
  (newStepComponent) => {
    if (isNil(newStepComponent)) return

    if (newStepComponent.initialize) {
      newStepComponent.initialize({
        goToNextStep,
        setEditableSteps,
        setBackButtonProps,
        setContinueButtonProps,
      })
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  },
  {
    immediate: true,
  }
)

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
    const stepSuccessOrNextStepName = await currentStepComponent.value?.continue()
    if (
      stepSuccessOrNextStepName === false ||
      isNil(stepSuccessOrNextStepName) ||
      (isString(stepSuccessOrNextStepName) && isEmpty(stepSuccessOrNextStepName))
    ) {
      return
    }

    if (stepSuccessOrNextStepName === true) {
      return goToNextStep()
    }

    const stepName = stepSuccessOrNextStepName
    return goToStep(stepName)
  } finally {
    isLoading.value = false
  }
}

/** @type {import('vue').Ref<InstanceType<typeof SummaryHeaderPanel> | null>} */
const summaryHeaderPanel = ref(null)

async function refreshHeaderAndLocalState() {
  await Promise.all([summaryHeaderPanel.value?.refresh(), refresh()])
}

function updateTravelAuthorizationSummary(attributes) {
  summaryHeaderPanel.value?.update(attributes)
}

const breadcrumbs = computed(() => [
  {
    text: "My Travel Requests",
    to: {
      name: "my-travel-requests/MyTravelRequestsPage",
    },
  },
  {
    text: "Wizard",
    disabled: true,
  },
  isNil(currentStep.value?.id)
    ? {
        text: "loading ...",
        disabled: true,
      }
    : {
        text: currentStep.value.subtitle,
        to: {
          name: "my-travel-requests/MyTravelRequestWizardPage",
          params: {
            travelAuthorizationId: travelAuthorizationIdAsNumber.value,
            stepName: currentStep.value.id,
          },
        },
      },
])
useBreadcrumbs(breadcrumbs)
</script>
