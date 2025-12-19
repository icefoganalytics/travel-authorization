import { computed, reactive, toRefs, unref, watch, type Ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { cloneDeep, isNil } from "lodash"

import type { VBtn } from "vuetify/lib/components"

import useTravelAuthorization, {
  type TravelAuthorizationAsShow,
  type TravelAuthorizationWizardStepNames,
} from "@/use/use-travel-authorization"

import MY_TRAVEL_REQUEST_WIZARD_STEPS, {
  type WizardStep,
} from "@/use/wizards/my-travel-request-wizard-steps"
import type { Route } from "vue-router"

export type UseMyTravelRequestWizard = {
  steps: Ref<WizardStep[]>
  isReady: Ref<boolean>

  currentStep: Ref<WizardStep | null>
  previousStep: Ref<WizardStep | null>
  nextStep: Ref<WizardStep | null>

  isLoading: Ref<boolean>
  refresh: () => Promise<TravelAuthorizationAsShow>

  goToStep: (stepName: TravelAuthorizationWizardStepNames) => Promise<Route | undefined>
  goToPreviousStep: () => Promise<Route>
  goToNextStep: () => Promise<Route>

  setEditableSteps: (stepNames: TravelAuthorizationWizardStepNames[]) => void
  setBackButtonProps: (vBtnProps: VBtn["props"]) => void
  setContinueButtonProps: (vBtnProps: VBtn["props"]) => void
}

export type WizardStepComponentContext = {
  goToNextStep: UseMyTravelRequestWizard["goToNextStep"]
  setEditableSteps: UseMyTravelRequestWizard["setEditableSteps"]
  setBackButtonProps: UseMyTravelRequestWizard["setBackButtonProps"]
  setContinueButtonProps: UseMyTravelRequestWizard["setContinueButtonProps"]
}

export function useMyTravelRequestWizard(
  travelAuthorizationIdRef: Ref<number | null | undefined>,
  wizardStepNameRef: Ref<string>
): UseMyTravelRequestWizard {
  const state = reactive<{
    steps: WizardStep[]
    isReady: boolean
  }>({
    steps: cloneDeep(Array.from(MY_TRAVEL_REQUEST_WIZARD_STEPS)),
    isReady: false,
  })

  const { travelAuthorization, isLoading, refresh, save } =
    useTravelAuthorization(travelAuthorizationIdRef)

  watch(
    () => cloneDeep(travelAuthorization.value),
    (newTravelAuthorization) => {
      if (!isNil(newTravelAuthorization?.id)) {
        state.isReady = true
      } else {
        state.isReady = false
      }
    }
  )

  const currentStep = computed<WizardStep | null>(() => {
    const currentStep = state.steps.find((step) => step.id === wizardStepNameRef.value)
    if (isNil(currentStep)) return null

    return currentStep
  })

  const currentStepIndex = computed(() =>
    state.steps.findIndex((step) => step.id === wizardStepNameRef.value)
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
    const travelAuthorizationId = unref(travelAuthorizationIdRef)
    if (isNil(travelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

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
        travelAuthorizationId: travelAuthorizationId.toString(),
        stepName: previousStepName,
      },
    })
  }

  async function goToNextStep(): Promise<Route> {
    const travelAuthorizationId = unref(travelAuthorizationIdRef)
    if (isNil(travelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

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
        travelAuthorizationId: travelAuthorizationId.toString(),
        stepName: nextStepName,
      },
    })
  }

  async function goToStep(newWizardStepName: TravelAuthorizationWizardStepNames) {
    const travelAuthorizationId = unref(travelAuthorizationIdRef)
    if (isNil(travelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    if (newWizardStepName === wizardStepNameRef.value) return

    const step = state.steps.find((step) => step.id === newWizardStepName)
    if (isNil(step)) return

    await save({
      wizardStepName: newWizardStepName,
    })
    return router.push({
      name: "my-travel-requests/MyTravelRequestWizardPage",
      params: {
        travelAuthorizationId: travelAuthorizationId.toString(),
        stepName: newWizardStepName,
      },
    })
  }

  function setEditableSteps(stepIds: TravelAuthorizationWizardStepNames[]) {
    state.steps.forEach((step) => {
      if (stepIds.includes(step.id)) {
        step.editable = true
      } else {
        step.editable = false
      }
    })
  }

  function setBackButtonProps(vBtnProps: VBtn["props"]) {
    if (isNil(currentStep.value)) return

    currentStep.value.backButtonProps = vBtnProps
  }

  function setContinueButtonProps(vBtnProps: VBtn["props"]) {
    if (isNil(currentStep.value)) return

    currentStep.value.continueButtonProps = vBtnProps
  }

  return {
    ...toRefs(state),
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
