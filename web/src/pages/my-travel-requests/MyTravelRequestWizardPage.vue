<template>
  <div>
    <div class="d-flex flex-column flex-md-row">
      <StateStepper
        class="flex-shrink-0"
        :steps="steps"
        :step-name="stepName"
        @update:stepName="goToStep"
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
              v-if="isNil(currentStep)"
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

            <v-skeleton-loader
              v-if="isNil(currentStep)"
              type="card"
            />
            <div
              v-else
              class="d-flex flex-column flex-md-row"
            >
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

<script lang="ts">
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

export type WizardStepComponent = {
  initialize?: (context: WizardStepComponentContext) => void
  back?: () => Promise<boolean>
  continue?: () => Promise<boolean | TravelAuthorizationWizardStepNames>
}

// this comment exist to prevent the above code block from breaking Vue 2 syntax highlighter
</script>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue"
import { isNil, isEmpty, isString } from "lodash"

import { TravelAuthorizationWizardStepNames } from "@/api/travel-authorizations-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import { type TravelAuthorizationSummary } from "@/use/travel-authorizations/use-travel-authorization-summary"
import useMyTravelRequestWizard from "@/use/wizards/use-my-travel-request-wizard"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import StateStepper from "@/components/common/wizards/StateStepper.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

const props = defineProps<{
  travelAuthorizationId: string
  stepName: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
const { stepName } = toRefs(props)

const {
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
} = useMyTravelRequestWizard(travelAuthorizationIdAsNumber, stepName)

const currentStepComponent = ref<WizardStepComponent | null>(null)

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

const summaryHeaderPanel = ref<InstanceType<typeof SummaryHeaderPanel> | null>(null)

async function refreshHeaderAndLocalState() {
  await Promise.all([summaryHeaderPanel.value?.refresh(), refresh()])
}

function updateTravelAuthorizationSummary(attributes: Partial<TravelAuthorizationSummary>) {
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
