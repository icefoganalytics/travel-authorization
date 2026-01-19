<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Hotel Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <SectionHeader
          title="1. Dates & Location"
          icon="mdi-calendar-month"
        />
        <v-row>
          <v-col cols="12">
            <DatePicker
              v-model="travelDeskHotelAttributes.checkIn"
              label="Check-in date *"
              :picker-date="tripStartDate"
              :min="tripStartDate"
              :max="tripEndDate"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <DatePicker
              v-model="travelDeskHotelAttributes.checkOut"
              label="Check-out date *"
              :picker-date="tripStartDate"
              :min="tripStartDate"
              :max="tripEndDate"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskHotelAttributes.city"
              label="City *"
              item-value="city"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <v-sheet class="grey lighten-4 rounded-lg px-4">
          <v-row>
            <v-col>
              <YesNoRowRadioGroup
                v-model="travelDeskHotelAttributes.isDedicatedConferenceHotelAvailable"
                label="Dedicated Conference/Meeting Hotel Available?"
                class="mt-1"
                @change="resetConferenceFieldsIfNo"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskHotelAttributes.isDedicatedConferenceHotelAvailable">
            <v-col cols="12">
              <v-text-field
                v-model="travelDeskHotelAttributes.conferenceName"
                :rules="[required]"
                label="Event Name *"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="travelDeskHotelAttributes.conferenceHotelName"
                label="Hotel Name *"
                :rules="[required]"
                outlined
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
          title="2. Additional Information"
          icon="mdi-note-text"
          header-class="mt-10 mt-md-0"
        />
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskHotelAttributes.additionalInformation"
              label="Additional Information"
              outlined
              rows="20"
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
        Save Hotel Request
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
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskHotelsApi, { type TravelDeskHotel } from "@/api/travel-desk-hotels-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import { isNil } from "lodash"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const travelDeskHotelAttributes = ref<Partial<TravelDeskHotel>>({
  travelRequestId: travelDeskTravelRequestIdAsNumber.value,
  checkIn: undefined,
  checkOut: undefined,
  city: undefined,
  isDedicatedConferenceHotelAvailable: true,
  conferenceName: undefined,
  conferenceHotelName: undefined,
  additionalInformation: undefined,
})

const { tripStartDate, tripEndDate } = useTravelTimesSummary(travelDeskTravelRequestIdAsNumber)

watch(tripStartDate, (newStartDate) => {
  if (isNil(newStartDate)) return
  if (!isNil(travelDeskHotelAttributes.value.checkIn)) return

  travelDeskHotelAttributes.value.checkIn = newStartDate
})
watch(tripEndDate, (newEndDate) => {
  if (isNil(newEndDate)) return
  if (!isNil(travelDeskHotelAttributes.value.checkOut)) return

  travelDeskHotelAttributes.value.checkOut = newEndDate
})

const router = useRouter()
const defaultReturnTo = computed(() => {
  const routeLocation = router.resolve({
    name: "travel-desk/TravelDeskRequestEditPage",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
  })
  return routeLocation.href
})
const returnTo = useRouteQuery("returnTo", defaultReturnTo)

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

function resetConferenceFieldsIfNo(value: boolean) {
  if (value === false) {
    travelDeskHotelAttributes.value.conferenceName = undefined
    travelDeskHotelAttributes.value.conferenceHotelName = undefined
  }
}

async function createAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  if (travelDeskHotelAttributes.value.isDedicatedConferenceHotelAvailable === false) {
    travelDeskHotelAttributes.value.conferenceName = undefined
    travelDeskHotelAttributes.value.conferenceHotelName = undefined
  }

  isSaving.value = true
  try {
    await travelDeskHotelsApi.create(travelDeskHotelAttributes.value)
    snack.success("Hotel request created successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to create hotel request: ${error}`, { error })
    snack.error(`Failed to create hotel request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const breadcrumbs = computed(() => [
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    text: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "New Hotel Request",
    to: {
      name: "travel-desk/hotels/TravelDeskHotelNewPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
