<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskRentalCar)"
    type="card@2"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit Rental Car Request"
    header-tag="h2"
    validate-on="lazy"
    @submit.prevent="saveAndReturn"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        variant="outlined"
        :loading="isDeleting"
        :block="smAndDown"
        @click="deleteAndReturn"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <SectionHeader
          title="1. Trip Schedule"
          icon="mdi-calendar-month"
        />
        <v-sheet class="grey lighten-4 rounded-lg px-4">
          <v-row>
            <v-col>
              <YesNoRowRadioGroup
                v-model="travelDeskRentalCar.matchFlightTimes"
                label="Pick-up/Drop-off match flights"
                class="mt-0"
                @update:model-value="requestFlightScheduleMatch"
              />
            </v-col>
          </v-row>
        </v-sheet>
        <v-alert
          v-if="flightScheduleFeedback"
          :type="isFlightScheduleLoading ? 'info' : 'warning'"
          class="mb-4"
        >
          {{ flightScheduleFeedback }}
        </v-alert>
        <v-row>
          <v-col cols="6">
            <StringDateInput
              v-model="pickUpDate"
              label="Pick-up date *"
              :disabled="isMatchingAvailableFlightSchedule"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="6">
            <TimeTextField
              v-model="pickUpTime"
              label="Pick-up time *"
              :disabled="isMatchingAvailableFlightSchedule"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <StringDateInput
              v-model="dropOffDate"
              label="Drop-off date *"
              :disabled="isMatchingAvailableFlightSchedule"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="6">
            <TimeTextField
              v-model="dropOffTime"
              label="Drop-off time *"
              :disabled="isMatchingAvailableFlightSchedule"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
        </v-row>

        <SectionHeader
          title="2. Location Details"
          icon="mdi-map-marker"
          header-class="mt-10"
        />
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskRentalCar.pickUpCity"
              label="Pick-up City *"
              :rules="[required]"
              item-value="cityUniqueLegacy"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12">
            <TravelDeskRentalCarLocationTypeSelect
              v-model="travelDeskRentalCar.pickUpLocation"
              label="Pick-up Location *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="resetPickUpLocationOtherUnlessOther"
            />
            <v-text-field
              v-if="travelDeskRentalCar.pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER"
              v-model="travelDeskRentalCar.pickUpLocationOther"
              label="Other Pick-up Location *"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
        </v-row>
        <v-sheet class="grey lighten-4 rounded-lg px-4">
          <v-row>
            <v-col>
              <YesNoRowRadioGroup
                v-model="travelDeskRentalCar.sameDropOffLocation"
                label="Same Drop-off location?"
                class="mt-1"
                @update:model-value="resetDropOffLocationStates"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskRentalCar.sameDropOffLocation === false">
            <v-col cols="12">
              <LocationsAutocomplete
                v-model="travelDeskRentalCar.dropOffCity"
                label="Drop-off City *"
                :rules="[required]"
                item-value="cityUniqueLegacy"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12">
              <TravelDeskRentalCarLocationTypeSelect
                v-model="travelDeskRentalCar.dropOffLocation"
                label="Drop-off Location *"
                :rules="[required]"
                variant="outlined"
                required
                @update:model-value="resetDropOffLocationOtherUnlessOther"
              />
              <v-text-field
                v-if="
                  travelDeskRentalCar.sameDropOffLocation === false &&
                  travelDeskRentalCar.dropOffLocation === TravelDeskRentalCarLocationTypes.OTHER
                "
                v-model="travelDeskRentalCar.dropOffLocationOther"
                label="Other Drop-off Location *"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <SectionHeader
          title="3. Vehicle & Extra Info"
          icon="mdi-car"
          header-class="mt-10 mt-md-0"
        />
        <v-row>
          <v-col cols="12">
            <TravelDeskRentalCarVehicleTypeSelect
              v-model="travelDeskRentalCar.vehicleType"
              label="Vehicle Type *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="resetVehicleChangeRationaleIfCompact"
            />
          </v-col>
          <v-col
            v-if="travelDeskRentalCar.vehicleType !== TravelDeskRentalCarVehicleTypes.COMPACT"
            cols="12"
          >
            <v-textarea
              v-model="travelDeskRentalCar.vehicleChangeRationale"
              label="Reason for Change *"
              hint="Please provide a reason for requesting a vehicle type other than Compact."
              :rules="[required]"
              variant="outlined"
              persistent-hint
              required
              rows="4"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskRentalCar.additionalNotes"
              label="Additional Information"
              variant="outlined"
              rows="10"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="mt-md-10" />

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :block="smAndDown"
      >
        Save Rental Car Request
      </v-btn>
      <v-btn
        class="ml-0 ml-md-4"
        color="grey"
        :to="returnTo"
        :block="smAndDown"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"
import { useDisplay } from "vuetify"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskRentalCarsApi, {
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarVehicleTypes,
} from "@/api/travel-desk-rental-cars-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskRentalCar from "@/use/use-travel-desk-rental-car"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import StringDateInput from "@/components/common/StringDateInput.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import TravelDeskRentalCarLocationTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarLocationTypeSelect.vue"
import TravelDeskRentalCarVehicleTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarVehicleTypeSelect.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
  travelDeskRentalCarId: string
}>()

const travelDeskRentalCarIdAsNumber = computed(() => parseInt(props.travelDeskRentalCarId))
const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const { travelDeskRentalCar, refresh } = useTravelDeskRentalCar(travelDeskRentalCarIdAsNumber)

const router = useRouter()
const defaultReturnTo = computed(() => {
  const routeLocation = router.resolve({
    name: "travel-desk/TravelDeskRequestEditRedirect",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
  })

  return routeLocation.href
})
const returnTo = useRouteQuery("returnTo", defaultReturnTo)

const DEFAULT_TIME = "12:00"

const pickUpDate = ref("")
const pickUpTime = ref(DEFAULT_TIME)
const dropOffDate = ref("")
const dropOffTime = ref(DEFAULT_TIME)

const {
  flightStartDate,
  flightEndDate,
  flightStartTime,
  flightEndTime,
  isFlightScheduleLoading,
  isFlightScheduleErrored,
} = useTravelTimesSummary(travelDeskTravelRequestIdAsNumber)

const unavailableFlightScheduleFields = computed(() => {
  const fields: string[] = []
  if (!flightStartDate.value) fields.push("pick-up date")
  if (!flightStartTime.value) fields.push("pick-up time")
  if (!flightEndDate.value) fields.push("drop-off date")
  if (!flightEndTime.value) fields.push("drop-off time")

  return fields
})
const isFlightScheduleAvailable = computed(() => {
  return (
    !isFlightScheduleLoading.value &&
    !isFlightScheduleErrored.value &&
    unavailableFlightScheduleFields.value.length === 0
  )
})
const isMatchingAvailableFlightSchedule = computed(() => {
  return (
    travelDeskRentalCar.value?.matchFlightTimes === true &&
    isFlightScheduleAvailable.value &&
    Boolean(pickUpDate.value && pickUpTime.value && dropOffDate.value && dropOffTime.value)
  )
})
const flightScheduleFeedback = computed(() => {
  if (travelDeskRentalCar.value?.matchFlightTimes !== true) return ""

  const unavailableFields = unavailableFlightScheduleFields.value.join(", ")
  if (isFlightScheduleLoading.value) {
    return `Flight schedule is loading. Waiting for: ${unavailableFields || "flight schedule confirmation"}. Enter dates and times manually, or wait for matching.`
  }

  if (isFlightScheduleErrored.value) {
    return `Flight schedule could not be loaded. Unavailable: ${unavailableFields || "flight schedule"}. Enter dates and times manually, or select No and try Yes again after reloading.`
  }

  if (unavailableFields) {
    return `Flight matching is unavailable for: ${unavailableFields}. Enter these fields manually, or add the missing flight details and try Yes again.`
  }

  return ""
})

const isFlightScheduleMatchRequested = ref(false)

function applyRequestedFlightSchedule() {
  if (!isFlightScheduleMatchRequested.value || !isFlightScheduleAvailable.value) return
  if (!flightStartDate.value || !flightStartTime.value) return
  if (!flightEndDate.value || !flightEndTime.value) return

  pickUpDate.value = flightStartDate.value
  pickUpTime.value = flightStartTime.value
  dropOffDate.value = flightEndDate.value
  dropOffTime.value = flightEndTime.value
  isFlightScheduleMatchRequested.value = false
}

function requestFlightScheduleMatch(value: boolean) {
  isFlightScheduleMatchRequested.value = value
  applyRequestedFlightSchedule()
}

watch(isFlightScheduleAvailable, applyRequestedFlightSchedule)

watch(
  () => travelDeskRentalCar.value?.pickUpDate,
  (isoDate) => {
    if (isNil(isoDate)) return

    const date = new Date(isoDate)
    pickUpDate.value = date.toISOString().split("T")[0]
    pickUpTime.value = date.toISOString().split("T")[1].substring(0, 5)
  },
  { immediate: true }
)

watch(
  () => travelDeskRentalCar.value?.dropOffDate,
  (isoDate) => {
    if (isNil(isoDate)) return

    const date = new Date(isoDate)
    dropOffDate.value = date.toISOString().split("T")[0]
    dropOffTime.value = date.toISOString().split("T")[1].substring(0, 5)
  },
  { immediate: true }
)

function resetPickUpLocationOtherUnlessOther(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  if (isNil(value) || value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.pickUpLocationOther = null
  }
}

function resetDropOffLocationOtherUnlessOther(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  if (isNil(value) || value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function resetDropOffLocationStates(value: boolean) {
  if (isNil(travelDeskRentalCar.value)) return

  if (value === true) {
    travelDeskRentalCar.value.dropOffCity = null
    travelDeskRentalCar.value.dropOffLocation = null
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function resetVehicleChangeRationaleIfCompact(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  if (isNil(value) || value === TravelDeskRentalCarVehicleTypes.COMPACT) {
    travelDeskRentalCar.value.vehicleChangeRationale = null
  }
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function saveAndReturn() {
  if (isNil(travelDeskRentalCar.value)) return
  if (isNil(headerActionsFormCard.value)) return

  const { valid } = await headerActionsFormCard.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  travelDeskRentalCar.value.pickUpDate = `${pickUpDate.value}T${pickUpTime.value}:00.000Z`
  travelDeskRentalCar.value.dropOffDate = `${dropOffDate.value}T${dropOffTime.value}:00.000Z`

  isSaving.value = true
  try {
    await travelDeskRentalCarsApi.update(
      travelDeskRentalCarIdAsNumber.value,
      travelDeskRentalCar.value
    )
    snack.success("Rental car request updated successfully!")
    await refresh()

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to update rental car request: ${error}`, { error })
    snack.error(`Failed to update rental car request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const isDeleting = ref(false)

async function deleteAndReturn() {
  if (!blockedToTrueConfirm("Are you sure you want to delete this rental car request?")) return

  isDeleting.value = true
  try {
    await travelDeskRentalCarsApi.delete(travelDeskRentalCarIdAsNumber.value)
    snack.success("Rental car request deleted successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to delete rental car request: ${error}`, { error })
    snack.error(`Failed to delete rental car request: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

const { smAndDown } = useDisplay()

const breadcrumbs = computed(() => [
  {
    title: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    title: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    title: "Edit Rental Car Request",
    to: {
      name: "travel-desk/rental-cars/TravelDeskRentalCarEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
        travelDeskRentalCarId: props.travelDeskRentalCarId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
