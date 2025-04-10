<template>
  <v-card>
    <v-card-title> Approvals </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-row>
          <v-col
            cols="12"
            md="2"
          >
            <EstimatedCostTextField :estimates="travelAuthorizationEstimates" />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelAdvanceInDollars"
              :rules="[required, isInteger]"
              label="Travel Advance"
              prefix="$"
              dense
              outlined
              required
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <TravelAuthorizationPreApprovalProfileSelect
              v-model="travelAuthorization.preApprovalProfileId"
              :query-options="{
                where: { department },
                filters: {
                  approved: true,
                  openDateOrBeforeStartDate: true,
                },
              }"
              dense
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
              :rules="[required]"
              label="Submit to"
              dense
              outlined
              required
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, toRefs } from "vue"

import { required, isInteger } from "@/utils/validators"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorization from "@/use/use-travel-authorization"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"
import TravelAuthorizationPreApprovalProfileSelect from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileSelect.vue"
import EstimatedCostTextField from "@/modules/travel-authorizations/components/EstimatedCostTextField.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  estimates: travelAuthorizationEstimates,
  submit,
} = useTravelAuthorization(travelAuthorizationId)

const { currentUser } = useCurrentUser()
const department = computed(() => {
  return currentUser.value?.department
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
const form = ref(null)

onMounted(async () => {
  await form.value?.resetValidation()
})

defineExpose({
  save: submit,
  validate: () => form.value?.validate(),
})
</script>
