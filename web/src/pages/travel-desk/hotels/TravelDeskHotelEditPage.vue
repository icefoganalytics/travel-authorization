<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskHotel)"
    type="card@2"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit Hotel Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="saveAndReturn"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        outlined
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
          title="1. Dates & Location"
          icon="mdi-calendar-month"
        />
        <v-row>
          <v-col cols="12">
            <DatePicker
              v-model="travelDeskHotel.checkIn"
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
              v-model="travelDeskHotel.checkOut"
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
              v-model="travelDeskHotel.city"
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
                v-model="travelDeskHotel.isDedicatedConferenceHotelAvailable"
                label="Dedicated Conference/Meeting Hotel Available?"
                class="mt-1"
                @change="resetConferenceFieldsIfNo"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskHotel.isDedicatedConferenceHotelAvailable">
            <v-col cols="12">
              <v-text-field
                v-model="travelDeskHotel.conferenceName"
                :rules="[required]"
                label="Event Name *"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="travelDeskHotel.conferenceHotelName"
                :rules="[required]"
                label="Hotel Name *"
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
              v-model="travelDeskHotel.additionalInformation"
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
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskHotelsApi from "@/api/travel-desk-hotels-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useSnack from "@/use/use-snack"
import useTravelDeskHotel from "@/use/use-travel-desk-hotel"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
  travelDeskHotelId: string
}>()

const travelDeskHotelIdAsNumber = computed(() => parseInt(props.travelDeskHotelId))
const { travelDeskHotel, refresh } = useTravelDeskHotel(travelDeskHotelIdAsNumber)

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { tripStartDate, tripEndDate } = useTravelTimesSummary(travelDeskTravelRequestIdAsNumber)

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
  if (isNil(travelDeskHotel.value)) return

  if (value === false) {
    travelDeskHotel.value.conferenceName = null
    travelDeskHotel.value.conferenceHotelName = null
  }
}

async function saveAndReturn() {
  if (isNil(travelDeskHotel.value)) return
  if (!headerActionsFormCard.value?.validate()) return

  isSaving.value = true
  try {
    await travelDeskHotelsApi.update(travelDeskHotelIdAsNumber.value, travelDeskHotel.value)
    snack.success("Hotel request saved successfully!")
    await refresh()

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to save hotel request: ${error}`, { error })
    snack.error(`Failed to save hotel request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const isDeleting = ref(false)

async function deleteAndReturn() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this hotel request?")) return

  isDeleting.value = true
  try {
    await travelDeskHotelsApi.delete(travelDeskHotelIdAsNumber.value)
    snack.success("Hotel request deleted successfully!")

    return router.replace(returnTo.value)
  } catch (error) {
    console.error(`Failed to delete hotel request: ${error}`, { error })
    snack.error(`Failed to delete hotel request: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

const { smAndDown } = useDisplayVuetify2()

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
    text: "Edit Hotel Request",
    to: {
      name: "travel-desk/hotels/TravelDeskHotelEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
        travelDeskHotelId: props.travelDeskHotelId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
