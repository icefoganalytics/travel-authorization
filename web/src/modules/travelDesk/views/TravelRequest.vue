<template>
  <v-card
    :loading="loadingData"
    :disabled="loadingData"
    en
    class="px-5 pb-15"
  >
    <div
      v-if="loadingData"
      class="mt-10"
      style="text-align: center"
    >
      loading ...
    </div>

    <div v-else>
      <v-toolbar
        class=""
        height="100px"
        flat
      >
        <v-toolbar-title>
          <b>Travel Requests </b>
          <b
            v-if="admin && department"
            class="mt-4 blue--text"
            >( {{ department }} )</b
          >
        </v-toolbar-title>
      </v-toolbar>
      <v-card>
        <TravelerRequests
          :authorized-travels="authorizedTravels"
          :return-to="returnTo"
          @updateTable="getAuthorizedTravels"
        />
      </v-card>
    </div>
  </v-card>
</template>

<script>
import Vue from "vue"
import { computed } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import { TRAVEL_DESK_URL, PROFILE_URL } from "@/urls"
import { useI18n } from "@/plugins/vue-i18n-plugin"
import http from "@/api/http-client"
import locationsApi from "@/api/locations-api"

import TravelerRequests from "@/modules/travelDesk/views/Requests/TravelerRequests.vue"

export default {
  name: "TravelRequest",
  components: {
    TravelerRequests,
  },
  setup() {
    const { t } = useI18n()

    const router = useRouter()
    const returnTo = computed(() => {
      const routeLocation = router.resolve({
        name: "TravelRequests",
      })
      return routeLocation.href
    })

    return {
      t,
      returnTo,
    }
  },
  data() {
    return {
      tabs: null,
      authorizedTravels: [],
      loadingData: false,
      department: "",
      admin: false,
    }
  },
  async mounted() {
    this.loadingData = true
    // await this.getUserAuth();
    this.department = this.$store.state.auth.department
    this.admin = Vue.filter("isAdmin")()
    await this.getDestinations()
    await this.getAuthorizedTravels()
    this.loadingData = false
  },

  methods: {
    async getUserAuth() {
      return http
        .get(PROFILE_URL)
        .then((resp) => {
          this.$store.commit("auth/setUser", resp.data.user)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getDestinations() {
      return locationsApi.list().then(({ locations }) => {
        const formattedLocations = locations.map(({ id, city, province }) => {
          return {
            value: id,
            text: `${city} (${province})`,
            city,
            province,
          }
        })
        this.$store.commit("traveldesk/SET_DESTINATIONS", formattedLocations)
        return formattedLocations
      })
    },

    async getAuthorizedTravels() {
      this.loadingData = true
      return http
        .get(`${TRAVEL_DESK_URL}/authorized-travels`)
        .then((resp) => {
          const authorizedTravels = resp.data
          this.extractAuthorizedTravels(authorizedTravels)
          this.loadingData = false
        })
        .catch((e) => {
          console.log(e)
          this.loadingData = false
        })
    },

    extractAuthorizedTravels(authorizedTravels) {
      // console.log(authorizedTravels)
      this.authorizedTravels = []

      for (const authorizedTravel of authorizedTravels) {
        // console.log(authorizedTravel)
        const phase = this.determineTravelPhase(authorizedTravel)

        const status =
          authorizedTravel.status == "Approved" ? "Approved" : "Awaiting Director Approval"

        let startDate
        if (!isNil(authorizedTravel.dateBackToWork)) {
          startDate = new Date(authorizedTravel.dateBackToWork.slice(0, 10) + "T01:00:00.000Z")
          //console.log(startDate.toUTCString())
          startDate.setDate(startDate.getDate() - 1 * Number(authorizedTravel.travelDuration))
          // console.log(startDate.toISOString())
          // console.log(startDate.toUTCString())
        }

        const locationIds = authorizedTravel.stops.map((stop) => stop.locationId)

        this.authorizedTravels.push({
          id: authorizedTravel.id,
          email: authorizedTravel.email,
          phase: phase,
          name: authorizedTravel.firstName + " " + authorizedTravel.lastName,
          locationIds: locationIds,
          description: authorizedTravel.purpose,
          startDate: startDate?.toISOString(),
          endDate: authorizedTravel.dateBackToWork,
          status: status,
          invoiceNumber: authorizedTravel.travelRequest?.invoiceNumber,
        })
      }
    },

    determineTravelPhase(authorizedTravel) {
      if (authorizedTravel.status != "Approved") return "Authorization"
      if (!authorizedTravel?.travelRequest?.status) return "Travel Approved"
      const { status } = authorizedTravel.travelRequest
      return this.t(`travel_desk_travel_request.status.${status}`, { $default: status })
    },
  },
}
</script>
