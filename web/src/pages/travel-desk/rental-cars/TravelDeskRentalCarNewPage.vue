<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Rental Car Request"
    header-tag="h2"
    validate-on="lazy"
    @submit.prevent="createAndReturn"
  >
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
                :model-value="travelDeskRentalCarAttributes.matchFlightTimes"
                label="Pick-up/Drop-off match flights"
                class="mt-0"
                @update:model-value="updateFlightMatching"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <TravelDeskRentalCarScheduleReadOnlySection
          v-if="isMatchingAvailableFlightSchedule"
          :pick-up-date="pickUpDate"
          :pick-up-time="pickUpTime"
          :drop-off-date="dropOffDate"
          :drop-off-time="dropOffTime"
        />
        <TravelDeskRentalCarScheduleEditSection
          v-else
          v-model:pick-up-date="pickUpDate"
          v-model:pick-up-time="pickUpTime"
          v-model:drop-off-date="dropOffDate"
          v-model:drop-off-time="dropOffTime"
          :trip-start-date="tripStartDate"
          :trip-end-date="tripEndDate"
        />

        <SectionHeader
          title="2. Location Details"
          icon="mdi-map-marker"
          header-class="mt-10"
        />
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              :model-value="pickUpCity"
              label="Pick-up City *"
              :rules="[required]"
              item-value="cityUniqueLegacy"
              variant="outlined"
              required
              @update:model-value="updatePickUpCity"
            />
          </v-col>
          <v-col cols="12">
            <TravelDeskRentalCarLocationTypeSelect
              :model-value="travelDeskRentalCarAttributes.pickUpLocation"
              label="Pick-up Location *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="updatePickUpLocation"
            />
            <v-text-field
              v-if="
                travelDeskRentalCarAttributes.pickUpLocation ===
                TravelDeskRentalCarLocationTypes.OTHER
              "
              v-model="travelDeskRentalCarAttributes.pickUpLocationOther"
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
                :model-value="travelDeskRentalCarAttributes.sameDropOffLocation"
                label="Same Drop-off location?"
                class="mt-1"
                @update:model-value="updateSameDropOffLocation"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskRentalCarAttributes.sameDropOffLocation === false">
            <v-col cols="12">
              <LocationsAutocomplete
                v-model="travelDeskRentalCarAttributes.dropOffCity"
                label="Drop-off City *"
                :rules="[required]"
                item-value="cityUniqueLegacy"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12">
              <TravelDeskRentalCarLocationTypeSelect
                :model-value="travelDeskRentalCarAttributes.dropOffLocation"
                label="Drop-off Location *"
                :rules="[required]"
                variant="outlined"
                required
                @update:model-value="updateDropOffLocation"
              />
              <v-text-field
                v-if="
                  travelDeskRentalCarAttributes.sameDropOffLocation === false &&
                  travelDeskRentalCarAttributes.dropOffLocation ===
                    TravelDeskRentalCarLocationTypes.OTHER
                "
                v-model="travelDeskRentalCarAttributes.dropOffLocationOther"
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
              :model-value="travelDeskRentalCarAttributes.vehicleType"
              label="Vehicle Type *"
              :rules="[required]"
              variant="outlined"
              required
              @update:model-value="updateVehicleType"
            />
          </v-col>
          <v-col
            v-if="
              travelDeskRentalCarAttributes.vehicleType !== TravelDeskRentalCarVehicleTypes.COMPACT
            "
            cols="12"
          >
            <v-textarea
              v-model="travelDeskRentalCarAttributes.vehicleChangeRationale"
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
              v-model="travelDeskRentalCarAttributes.additionalNotes"
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
        :disabled="isSaving"
      >
        Save Rental Car Request
      </v-btn>
      <v-btn
        color="grey"
        :to="returnTo"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskRentalCarsApi, {
  type TravelDeskRentalCar,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarVehicleTypes,
} from "@/api/travel-desk-rental-cars-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import TravelDeskRentalCarLocationTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarLocationTypeSelect.vue"
import TravelDeskRentalCarScheduleEditSection from "@/components/travel-desk-rental-cars/TravelDeskRentalCarScheduleEditSection.vue"
import TravelDeskRentalCarScheduleReadOnlySection from "@/components/travel-desk-rental-cars/TravelDeskRentalCarScheduleReadOnlySection.vue"
import TravelDeskRentalCarVehicleTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarVehicleTypeSelect.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const { tripStartDate, tripEndDate, finalDestination, availableFlightSchedule } =
  useTravelTimesSummary(travelDeskTravelRequestIdAsNumber)

const travelDeskRentalCarAttributes = ref<Partial<TravelDeskRentalCar>>({
  travelRequestId: travelDeskTravelRequestIdAsNumber.value,
  pickUpCity: undefined,
  pickUpLocation: undefined,
  pickUpLocationOther: undefined,
  dropOffCity: undefined,
  dropOffLocation: undefined,
  dropOffLocationOther: undefined,
  sameDropOffLocation: true,
  matchFlightTimes: false,
  vehicleType: TravelDeskRentalCarVehicleTypes.COMPACT,
  vehicleChangeRationale: undefined,
  additionalNotes: undefined,
})

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

const scheduleBeforeFlightMatching = ref<{
  pickUpDate: string
  pickUpTime: string
  dropOffDate: string
  dropOffTime: string
} | null>(null)

const isFlightScheduleAvailable = computed(() => !isNil(availableFlightSchedule.value))
const isMatchingAvailableFlightSchedule = computed(
  () =>
    travelDeskRentalCarAttributes.value.matchFlightTimes === true && isFlightScheduleAvailable.value
)

const isWaitingForFlightSchedule = ref(false)

function updateFlightMatching(value: boolean) {
  if (value) {
    enableFlightMatching()
  } else {
    disableFlightMatching()
  }
}

function enableFlightMatching() {
  travelDeskRentalCarAttributes.value.matchFlightTimes = true
  isWaitingForFlightSchedule.value = false

  const schedule = availableFlightSchedule.value
  if (isNil(schedule)) {
    isWaitingForFlightSchedule.value = true
    return
  }

  preserveManualSchedule()

  pickUpDate.value = schedule.startDate
  pickUpTime.value = schedule.startTime
  dropOffDate.value = schedule.endDate
  dropOffTime.value = schedule.endTime
}

function disableFlightMatching() {
  travelDeskRentalCarAttributes.value.matchFlightTimes = false
  isWaitingForFlightSchedule.value = false
  restoreManualSchedule()
}

function preserveManualSchedule() {
  if (!isNil(scheduleBeforeFlightMatching.value)) return

  scheduleBeforeFlightMatching.value = {
    pickUpDate: pickUpDate.value,
    pickUpTime: pickUpTime.value,
    dropOffDate: dropOffDate.value,
    dropOffTime: dropOffTime.value,
  }
}

function restoreManualSchedule() {
  if (isNil(scheduleBeforeFlightMatching.value)) return

  pickUpDate.value = scheduleBeforeFlightMatching.value.pickUpDate
  pickUpTime.value = scheduleBeforeFlightMatching.value.pickUpTime
  dropOffDate.value = scheduleBeforeFlightMatching.value.dropOffDate
  dropOffTime.value = scheduleBeforeFlightMatching.value.dropOffTime
  scheduleBeforeFlightMatching.value = null
}

watch(isFlightScheduleAvailable, (isAvailable) => {
  if (isAvailable && isWaitingForFlightSchedule.value) {
    enableFlightMatching()
  }
})

const pickUpCity = computed(() => {
  const selectedCity = travelDeskRentalCarAttributes.value.pickUpCity
  if (!isNil(selectedCity)) return selectedCity

  const destination = finalDestination.value
  if (isNil(destination)) return undefined

  return `${destination.city} (${destination.province})`
})

function updatePickUpCity(value: string | null) {
  travelDeskRentalCarAttributes.value.pickUpCity = value ?? ""
}

function updatePickUpLocation(value: string | null) {
  travelDeskRentalCarAttributes.value.pickUpLocation = value ?? ""

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCarAttributes.value.pickUpLocationOther = undefined
  }
}

function updateSameDropOffLocation(value: boolean) {
  travelDeskRentalCarAttributes.value.sameDropOffLocation = value

  if (value === true) {
    travelDeskRentalCarAttributes.value.dropOffCity = undefined
    travelDeskRentalCarAttributes.value.dropOffLocation = undefined
    travelDeskRentalCarAttributes.value.dropOffLocationOther = undefined
  }
}

function updateDropOffLocation(value: string | null) {
  travelDeskRentalCarAttributes.value.dropOffLocation = value

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCarAttributes.value.dropOffLocationOther = undefined
  }
}

function updateVehicleType(value: string | null) {
  travelDeskRentalCarAttributes.value.vehicleType = value ?? ""

  if (isNil(value) || value === TravelDeskRentalCarVehicleTypes.COMPACT) {
    travelDeskRentalCarAttributes.value.vehicleChangeRationale = undefined
  }
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function createAndReturn() {
  if (isNil(headerActionsFormCard.value)) return

  const { valid } = await headerActionsFormCard.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  // TODO: Notify the user, in the UI, that times are in UTC?
  // Or maybe make them local to city?
  // Oversight in original code so not fixing at this time.
  // This could be fixed by adding timezone to locations, and making time save
  // in location's timezone.
  travelDeskRentalCarAttributes.value.pickUpDate = `${pickUpDate.value}T${pickUpTime.value}:00.000Z`
  travelDeskRentalCarAttributes.value.dropOffDate = `${dropOffDate.value}T${dropOffTime.value}:00.000Z`

  isSaving.value = true
  try {
    await travelDeskRentalCarsApi.create({
      ...travelDeskRentalCarAttributes.value,
      pickUpCity: pickUpCity.value,
    })
    snack.success("Rental car request created successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to create rental car request: ${error}`, { error })
    snack.error(`Failed to create rental car request: ${error}`)
  } finally {
    isSaving.value = false
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
    title: "New Rental Car Request",
    to: {
      name: "travel-desk/rental-cars/TravelDeskRentalCarNewPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
