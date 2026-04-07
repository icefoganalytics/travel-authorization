<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-baseline">
      <v-col
        cols="12"
        md="6"
        class="py-0"
      >
        <h3>Per-Diems</h3>
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column flex-md-row align-baseline py-0"
      >
        <div>Filters:</div>
        <ClaimTypeSelect
          v-model="claimType"
          class="ml-2"
          outlined
          hide-details
          clearable
        />
      </v-col>
    </v-card-title>

    <v-data-table-server
      v-model:page="page"
      v-model:items-per-page="perPage"
      :headers="headers"
      :items="perDiems"
      :loading="isLoading"
      :items-length="totalCount"
      :footer-props="{
        'items-per-page-options': [6, 10, 15, -1],
      }"
      @dblclick:row="(_, { item }) => showEditDialog(item)"
    >
      <template #top>
        <EditPerDiemDialog
          ref="editPerDiemDialog"
          @saved="refresh"
        />
      </template>
      <template #item.claimType="{ value }">
        {{ t(`per_diem.claim_type.${value}`, value) }}
      </template>
      <template #item.travelRegion="{ value }">
        {{ t(`per_diem.travel_region.${value}`, value) }}
      </template>
      <template #item.amount="{ item, value }">
        {{ formatCurrency(value, item.currency) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end">
          <v-btn
            title="Edit"
            icon
            color="blue"
            @click="showEditDialog(item)"
            ><v-icon>mdi-pencil</v-icon></v-btn
          >
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"

import formatCurrency from "@/utils/format-currency"
import useRouteQuery from "@/use/utils/use-route-query"
import usePerDiems from "@/use/use-per-diems"

import ClaimTypeSelect from "@/components/per-diems/ClaimTypeSelect.vue"
import EditPerDiemDialog from "@/components/per-diems/EditPerDiemDialog.vue"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */

const { t } = useI18n()

const headers = ref([
  {
    title: "Claim Type",
    key: "claimType",
  },
  {
    title: "Travel Region",
    key: "travelRegion",
  },
  {
    title: "Amount",
    key: "amount",
  },
  {
    title: "",
    key: "actions",
  },
])

const page = useRouteQuery("perDiemsPage", "1", { transform: parseInt })
const perPage = useRouteQuery("perDiemsPerPage", "6", { transform: parseInt })
const claimType = useRouteQuery("perDiemsClaimType")

const perDiemsQuery = computed(() => ({
  where: {
    claimType: claimType.value,
  },
  page: page.value,
  perPage: perPage.value,
}))
const { perDiems, totalCount, isLoading, refresh } = usePerDiems(perDiemsQuery)

/** @type {Ref<InstanceType<typeof EditPerDiemDialog> | null>} */
const editPerDiemDialog = ref(null)

function showEditDialog(perDiem) {
  editPerDiemDialog.value?.show(perDiem)
}
</script>

<style scoped></style>
