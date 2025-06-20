import { computed, reactive, toRefs, watch } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { cloneDeep, isNil } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import MY_TRAVEL_REQUEST_WIZARD_STEPS from "@/use/wizards/my-travel-request-wizard-steps"

export function useMyTravelRequestWizard(travelAuthorizationId) {
  const state = reactive({
    steps: cloneDeep(MY_TRAVEL_REQUEST_WIZARD_STEPS),
    isReady: false,
  })

  const { travelAuthorization, isLoading, refresh, save } =
    useTravelAuthorization(travelAuthorizationId)

  watch(
    () => cloneDeep(travelAuthorization.value),
    (newTravelAuthorization) => {
      if (!isNil(newTravelAuthorization.id)) {
        state.isReady = true
      } else {
        state.isReady = false
      }
    }
  )

  const currentWizardStepName = computed(() => travelAuthorization.value.wizardStepName || null)

  const currentStep = computed(() => {
    const currentStep = state.steps.find((step) => step.id === currentWizardStepName.value)
    if (isNil(currentStep)) {
      return {
        continueButtonText: "Continue",
      }
    }

    return currentStep
  })

  const currentStepIndex = computed(() =>
    state.steps.findIndex((step) => step.id === currentWizardStepName.value)
  )

  const previousStep = computed(() => {
    const previousStepIndex = currentStepIndex.value - 1
    if (previousStepIndex < 0) return null

    const previousStep = state.steps[previousStepIndex]
    if (isNil(previousStep)) return null

    return previousStep
  })

  const nextStep = computed(() => {
    const nextStep = state.steps[currentStepIndex.value + 1]
    if (isNil(nextStep)) return null

    return nextStep
  })

  const router = useRouter()

  async function goToPreviousStep() {
    if (isNil(previousStep.value)) {
      return router.push({
        name: "my-travel-requests/MyTravelRequestsPage",
      })
    }

    const previousStepName = previousStep.value.id
    await save({
      wizardStepName: previousStepName,
    })
    return router.push({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorizationId.value,
        stepName: previousStepName,
      },
    })
  }

  async function goToNextStep() {
    if (isNil(nextStep.value)) {
      return router.push({
        name: "my-travel-requests/MyTravelRequestsPage",
      })
    }

    const nextStepName = nextStep.value.id
    await save({
      wizardStepName: nextStepName,
    })
    return router.push({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorizationId.value,
        stepName: nextStepName,
      },
    })
  }

  async function goToStep(stepName) {
    if (stepName === currentWizardStepName.value) return

    const step = state.steps.find((step) => step.id === stepName)
    if (isNil(step)) return

    await save({
      wizardStepName: stepName,
    })
    return router.push({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorizationId.value,
        stepName,
      },
    })
  }

  function setEditableSteps(stepIds) {
    state.steps.forEach((step) => {
      if (stepIds.includes(step.id)) {
        step.editable = true
      } else {
        step.editable = false
      }
    })
  }

  function setBackButtonProps(props) {
    currentStep.value.backButtonProps = props
  }

  function setContinueButtonProps(props) {
    currentStep.value.continueButtonProps = props
  }

  return {
    ...toRefs(state),
    currentWizardStepName,
    currentStep,
    previousStep,
    nextStep,
    isLoading,
    refresh,
    goToStep,
    goToPreviousStep,
    goToNextStep,
    setEditableSteps,
    setBackButtonProps,
    setContinueButtonProps,
  }
}

export default useMyTravelRequestWizard
