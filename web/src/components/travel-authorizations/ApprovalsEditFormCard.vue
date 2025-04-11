<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="Approvals"
    lazy-validation
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <EstimatedCostDescriptionElement
          label="Estimated Cost"
          :travel-authorization-id="travelAuthorizationId"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="travelAdvanceInDollars"
          :rules="[required, isInteger]"
          label="Travel Advance"
          prefix="$"
          outlined
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelAuthorizationPreApprovalProfileSearchableAutocomplete
          v-model="travelAuthorization.preApprovalProfileId"
          :where="travelAuthorizationPreApprovalProfileWhere"
          :filters="travelAuthorizationPreApprovalProfileFilters"
          outlined
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <UserEmailSearchableCombobox
          v-model="travelAuthorization.supervisorEmail"
          label="Submit to *"
          :rules="[required]"
          outlined
          required
        />
      </v-col>
    </v-row>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, onMounted, ref, toRefs } from "vue"
import { isNil } from "lodash"

import { required, isInteger } from "@/utils/validators"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import EstimatedCostDescriptionElement from "@/components/travel-authorizations/EstimatedCostDescriptionElement.vue"
import TravelAuthorizationPreApprovalProfileSearchableAutocomplete from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileSearchableAutocomplete.vue"
import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, submit } = useTravelAuthorization(travelAuthorizationId)

const { currentUser } = useCurrentUser()
const travelAuthorizationPreApprovalProfileWhere = computed(() => {
  const { department } = currentUser.value
  if (isNil(department)) return {}

  return {
    department,
  }
})
const travelAuthorizationPreApprovalProfileFilters = computed(() => {
  return {
    approved: true,
    openDateOrBeforeStartDate: true,
  }
})
const travelAdvanceInDollars = computed({
  get() {
    return Math.ceil(travelAuthorization.value.travelAdvanceInCents / 100.0) || 0
  },
  set(value) {
    travelAuthorization.value.travelAdvanceInCents = Math.ceil(value * 100)
  },
})

/** @type {import('vue').Ref<typeof import('vuetify/lib/components').VForm | null>} */
const headerActionsFormCard = ref(null)

onMounted(async () => {
  await headerActionsFormCard.value?.resetValidation()
})

defineExpose({
  save: submit,
  validate: () => headerActionsFormCard.value?.validate(),
})
</script>
