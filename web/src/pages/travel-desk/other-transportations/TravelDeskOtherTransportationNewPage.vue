<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Other Transportation Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-bus</v-icon
          >
          1. Transportation Details
        </h3>
        <v-row>
          <v-col cols="12">
            <TravelDeskOtherTransportationTypeSelect
              v-model="travelDeskOtherTransportationAttributes.transportationType"
              label="Transportation Type *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <h3 class="primary--text mt-10">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-map-marker-path</v-icon
          >
          2. Route &amp; Schedule
        </h3>
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskOtherTransportationAttributes.depart"
              label="Departure Location *"
              item-value="city"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskOtherTransportationAttributes.arrive"
              label="Arrival Location *"
              item-value="city"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <DatePicker
              v-model="travelDeskOtherTransportationAttributes.date"
              label="Travel Date *"
              :picker-date="tripStartDate"
              :min="tripStartDate"
              :max="tripEndDate"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text mt-10 mt-md-0">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-note-text</v-icon
          >
          3. Additional Information
        </h3>
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskOtherTransportationAttributes.additionalNotes"
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
        Save Transportation Request
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

import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskOtherTransportationsApi, {
  type TravelDeskOtherTransportation,
  TravelDeskOtherTransportationStatuses,
} from "@/api/travel-desk-other-transportations-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelDeskOtherTransportationTypeSelect from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationTypeSelect.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const travelDeskOtherTransportationAttributes = ref<Partial<TravelDeskOtherTransportation>>({
  travelRequestId: travelDeskTravelRequestIdAsNumber.value,
  transportationType: undefined,
  depart: undefined,
  arrive: undefined,
  date: undefined,
  additionalNotes: undefined,
  status: TravelDeskOtherTransportationStatuses.REQUESTED,
})

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

async function createAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  isSaving.value = true
  try {
    await travelDeskOtherTransportationsApi.create(travelDeskOtherTransportationAttributes.value)
    snack.success("Transportation request created successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to create transportation request: ${error}`, { error })
    snack.error(`Failed to create transportation request: ${error}`)
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
    text: "New Other Transportation Request",
    to: {
      name: "travel-desk/other-transportations/TravelDeskOtherTransportationNewPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
