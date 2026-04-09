<template>
  <ApprovalsEditFormCard
    ref="approvalsEditFormCard"
    class="mt-4"
    :travel-authorization-id="travelAuthorizationIdAsNumber"
  >
    <template #actions>
      <v-btn
        color="primary"
        :loading="isLoading"
        @click="validateSubmitAndReturn"
      >
        Submit
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        :to="{
          name: 'manage-travel-requests/ManageTravelRequestDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Cancel
      </v-btn>
    </template>
  </ApprovalsEditFormCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

import ApprovalsEditFormCard from "@/components/travel-authorizations/ApprovalsEditFormCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["updated"])

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const isLoading = ref(false)
/** @type {import('vue').Ref<InstanceType<typeof ApprovalsEditFormCard> | null>} */
const approvalsEditFormCard = ref(null)
const snack = useSnack()
const router = useRouter()

async function validateSubmitAndReturn() {
  if (isNil(approvalsEditFormCard.value)) return

  const { valid } = await approvalsEditFormCard.value.validate()
  if (!valid) {
    snack.error("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    await approvalsEditFormCard.value.submit()
    snack.success("Travel request submitted.")
    emit("updated", props.travelAuthorizationId)
    return router.push({
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  } catch (error) {
    console.error(`Failed to submit travel request: ${error}`, { error })
    snack.error(`Failed to submit travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs([
  {
    title: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    title: "Details",
    to: {
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
  {
    title: "Edit Approvals",
    to: {
      name: "manage-travel-requests/ManageTravelRequestEditApprovalDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
</script>
