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
                :model-value="travelDeskRentalCar.matchFlightTimes"
                label="Pick-up/Drop-off match flights"
                class="mt-0"
                @update:model-value="requestFlightScheduleMatch"
              />
            </v-col>
          </v-row>
        </v-sheet>
        <template v-if="isMatchingAvailableFlightSchedule">
          <v-row>
            <v-col cols="6">
              <StringDateInput
                :model-value="pickUpDate"
                label="Pick-up date *"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
            <v-col cols="6">
              <TimeTextField
                :model-value="pickUpTime"
                label="Pick-up time *"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <StringDateInput
                :model-value="dropOffDate"
                label="Drop-off date *"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
            <v-col cols="6">
              <TimeTextField
                :model-value="dropOffTime"
                label="Drop-off time *"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
        </template>
        <template v-else>
          <v-row>
            <v-col cols="6">
              <StringDateInput
                v-model="pickUpDate"
                label="Pick-up date *"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="6">
              <TimeTextField
                v-model="pickUpTime"
                label="Pick-up time *"
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
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="6">
              <TimeTextField
                v-model="dropOffTime"
                label="Drop-off time *"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </template>

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
              :model-value="travelDeskRentalCar.pickUpLocation"
              label="Pick-up Location *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="updatePickUpLocation"
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
                :model-value="travelDeskRentalCar.sameDropOffLocation"
                label="Same Drop-off location?"
                class="mt-1"
                @update:model-value="updateSameDropOffLocation"
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
                :model-value="travelDeskRentalCar.dropOffLocation"
                label="Drop-off Location *"
                :rules="[required]"
                variant="outlined"
                required
                @update:model-value="updateDropOffLocation"
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
              :model-value="travelDeskRentalCar.vehicleType"
              label="Vehicle Type *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="updateVehicleType"
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
import { isEmpty, isNil } from "lodash"
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

const { smAndDown } = useDisplay()

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

const { travelDeskRentalCar, refresh } = useTravelDeskRentalCar(travelDeskRentalCarIdAsNumber)

const DEFAULT_TIME = "12:00"

const pickUpDate = ref("")
const pickUpTime = ref(DEFAULT_TIME)
const dropOffDate = ref("")
const dropOffTime = ref(DEFAULT_TIME)

function populateScheduleFromRentalCar() {
  const rentalCar = travelDeskRentalCar.value
  if (isNil(rentalCar)) return

  if (!isNil(rentalCar.pickUpDate)) {
    const date = new Date(rentalCar.pickUpDate)
    pickUpDate.value = date.toISOString().split("T")[0]
    pickUpTime.value = date.toISOString().split("T")[1].substring(0, 5)
  }

  if (!isNil(rentalCar.dropOffDate)) {
    const date = new Date(rentalCar.dropOffDate)
    dropOffDate.value = date.toISOString().split("T")[0]
    dropOffTime.value = date.toISOString().split("T")[1].substring(0, 5)
  }
}

watch(travelDeskRentalCar, populateScheduleFromRentalCar, { immediate: true })

const isScheduleComplete = computed(() => {
  return (
    !isEmpty(pickUpDate.value) &&
    !isEmpty(pickUpTime.value) &&
    !isEmpty(dropOffDate.value) &&
    !isEmpty(dropOffTime.value)
  )
})

const { availableFlightSchedule } = useTravelTimesSummary(travelDeskTravelRequestIdAsNumber)
const isFlightScheduleAvailable = computed(() => !isNil(availableFlightSchedule.value))
const isMatchingAvailableFlightSchedule = computed(() => {
  return (
    travelDeskRentalCar.value?.matchFlightTimes === true &&
    isFlightScheduleAvailable.value &&
    isScheduleComplete.value
  )
})

const isFlightScheduleMatchRequested = ref(false)

function applyRequestedFlightSchedule() {
  const schedule = availableFlightSchedule.value
  if (!isFlightScheduleMatchRequested.value || isNil(schedule)) return

  pickUpDate.value = schedule.startDate
  pickUpTime.value = schedule.startTime
  dropOffDate.value = schedule.endDate
  dropOffTime.value = schedule.endTime
  isFlightScheduleMatchRequested.value = false
}

function requestFlightScheduleMatch(value: boolean) {
  if (isNil(travelDeskRentalCar.value)) return

  travelDeskRentalCar.value.matchFlightTimes = value
  isFlightScheduleMatchRequested.value = value
  applyRequestedFlightSchedule()
}

watch(isFlightScheduleAvailable, applyRequestedFlightSchedule)

function updatePickUpLocation(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  travelDeskRentalCar.value.pickUpLocation = value ?? ""

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.pickUpLocationOther = null
  }
}

function updateSameDropOffLocation(value: boolean) {
  if (isNil(travelDeskRentalCar.value)) return

  travelDeskRentalCar.value.sameDropOffLocation = value

  if (value === true) {
    travelDeskRentalCar.value.dropOffCity = null
    travelDeskRentalCar.value.dropOffLocation = null
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function updateDropOffLocation(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  travelDeskRentalCar.value.dropOffLocation = value

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function updateVehicleType(value: string | null) {
  if (isNil(travelDeskRentalCar.value)) return

  travelDeskRentalCar.value.vehicleType = value ?? ""

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
