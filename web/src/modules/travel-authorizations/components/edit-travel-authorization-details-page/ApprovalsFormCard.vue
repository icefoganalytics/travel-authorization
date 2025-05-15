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
            <EstimatedCostTextField :estimates="estimates" />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-btn
              v-if="hasEstimates"
              :to="{
                name: 'EditTravelAuthorizationEstimatePage',
                params: { travelAuthorizationId: travelAuthorizationId },
              }"
              class="mt-1"
              color="secondary"
              >Edit Estimate</v-btn
            >
            <EstimateGenerateDialog
              v-else
              :travel-authorization-id="travelAuthorizationId"
              button-classes="mt-1"
              button-color="primary"
              @created="refreshEstimates"
            />
          </v-col>
        </v-row>
        <v-row>
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
            md="3"
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
          <v-col
            cols="12"
            md="3"
          >
            <SubmitToSupervisorButton
              :travel-authorization-id="travelAuthorizationId"
              :validate="validate"
              :estimates="estimates"
              class="mt-1"
            />
          </v-col>
        </v-row>
      </v-form>

      <v-row>
        <v-col>
          <TravelAuthorizationActionLogsTable :travel-authorization-id="travelAuthorizationId" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"

import { required, isInteger } from "@/utils/validators"
import useExpenses, { TYPES as EXPENSE_TYPES } from "@/use/use-expenses"
import useUser from "@/use/use-user"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"
import TravelAuthorizationPreApprovalProfileSelect from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileSelect"
import EstimatedCostTextField from "@/modules/travel-authorizations/components/EstimatedCostTextField.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

import EstimateGenerateDialog from "@/modules/travel-authorizations/components/edit-travel-authorization-details-page/approvals-form-card/EstimateGenerateDialog"
import SubmitToSupervisorButton from "@/modules/travel-authorizations/components/edit-travel-authorization-details-page/approvals-form-card/SubmitToSupervisorButton"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  validate: {
    type: Function,
    required: true,
  },
})

const { travelAuthorization } = useTravelAuthorization(props.travelAuthorizationId)
const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: EXPENSE_TYPES.ESTIMATE,
  },
}))
const { expenses: estimates, fetch: refreshEstimates } = useExpenses(expenseOptions)
const userId = computed(() => travelAuthorization.value.userId)
const { user } = useUser(userId)

const department = computed(() => user.value?.department)

const travelAdvanceInDollars = computed({
  get() {
    return Math.ceil(travelAuthorization.value.travelAdvanceInCents / 100.0) || 0
  },
  set(value) {
    travelAuthorization.value.travelAdvanceInCents = Math.ceil(value * 100)
  },
})
const hasEstimates = computed(() => estimates.value.length > 0)
</script>
