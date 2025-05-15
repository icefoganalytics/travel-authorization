<template>
  <PurposeEditFormCard
    ref="purposeEditFormCard"
    class="mt-4"
    :travel-authorization-id="travelAuthorizationIdAsNumber"
    v-on="$listeners"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="isLoading"
        @click="validateSaveAndReturn"
      >
        Save
      </v-btn>
      <v-btn
        color="primary"
        outlined
        :to="{
          name: 'manage-travel-requests/ManageTravelRequestDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
        >Cancel</v-btn
      >
    </template>
  </PurposeEditFormCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(["updated"])

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof PurposeEditFormCard> | null>} */
const purposeEditFormCard = ref(null)
const snack = useSnack()
const router = useRouter()

async function validateSaveAndReturn() {
  if (isNil(purposeEditFormCard.value)) return
  if (!purposeEditFormCard.value.validate()) {
    snack.error("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    await purposeEditFormCard.value.save()
    snack.success("Travel request saved.")
    emit("updated", props.travelAuthorizationId)
    return router.push({
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  } catch (error) {
    console.error(`Failed to save travel request: ${error}`, { error })
    snack.error(`Failed to save travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    text: "Details",
    to: {
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
  {
    text: "Edit Purpose",
    to: {
      name: "manage-travel-requests/ManageTravelRequestEditPurposeDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
</script>
