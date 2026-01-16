<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskOtherTransportation)"
    type="card@2"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit Other Transportation Request"
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
          title="1. Transportation Details"
          icon="mdi-bus"
        />
        <v-row>
          <v-col cols="12">
            <TravelDeskOtherTransportationTypeSelect
              v-model="travelDeskOtherTransportation.transportationType"
              label="Transportation Type *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <SectionHeader
          title="2. Route &amp; Schedule"
          icon="mdi-map-marker-path"
          header-class="mt-10"
        />
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskOtherTransportation.depart"
              label="Departure Location *"
              item-value="city"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskOtherTransportation.arrive"
              label="Arrival Location *"
              item-value="city"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <DatePicker
              v-model="travelDeskOtherTransportation.date"
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
        <SectionHeader
          title="3. Additional Information"
          icon="mdi-note-text"
          header-class="mt-10 mt-md-0"
        />
        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskOtherTransportation.additionalNotes"
              label="Additional Information"
              outlined
              rows="15"
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
        Save Transportation Request
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
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskOtherTransportationsApi from "@/api/travel-desk-other-transportations-api"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskOtherTransportation from "@/use/use-travel-desk-other-transportation"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelDeskOtherTransportationTypeSelect from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationTypeSelect.vue"

const props = defineProps<{
  travelDeskOtherTransportationId: string
  travelDeskTravelRequestId: string
}>()

const { smAndDown } = useDisplayVuetify2()

const travelDeskOtherTransportationIdAsNumber = computed(() =>
  parseInt(props.travelDeskOtherTransportationId)
)
const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const { travelDeskOtherTransportation, refresh } = useTravelDeskOtherTransportation(
  travelDeskOtherTransportationIdAsNumber
)

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

async function saveAndReturn() {
  if (isNil(travelDeskOtherTransportation.value)) return
  if (!headerActionsFormCard.value?.validate()) return

  isSaving.value = true
  try {
    await travelDeskOtherTransportationsApi.update(
      travelDeskOtherTransportationIdAsNumber.value,
      travelDeskOtherTransportation.value
    )
    snack.success("Transportation request saved successfully!")
    await refresh()

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to save transportation request: ${error}`, { error })
    snack.error(`Failed to save transportation request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const isDeleting = ref(false)

async function deleteAndReturn() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this transportation request?")) {
    return
  }

  isDeleting.value = true
  try {
    await travelDeskOtherTransportationsApi.delete(travelDeskOtherTransportationIdAsNumber.value)
    snack.success("Transportation request deleted successfully!")
    return router.replace(returnTo.value)
  } catch (error) {
    console.error(`Failed to delete transportation request: ${error}`, { error })
    snack.error(`Failed to delete transportation request: ${error}`)
  } finally {
    isDeleting.value = false
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
    text: "Edit Transportation Request",
    to: {
      name: "travel-desk/other-transportations/TravelDeskOtherTransportationEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
        travelDeskOtherTransportationId: props.travelDeskOtherTransportationId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
