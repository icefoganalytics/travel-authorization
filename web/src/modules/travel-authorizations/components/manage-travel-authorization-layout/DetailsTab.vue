<template>
  <v-tab
    :to="{
      name: 'manage-travel-requests/ManageTravelRequestDetailsPage',
      params: { travelAuthorizationId },
    }"
  >
    Details
  </v-tab>
</template>

<script>
export default {
  name: "DetailsTab",
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
}
</script>
