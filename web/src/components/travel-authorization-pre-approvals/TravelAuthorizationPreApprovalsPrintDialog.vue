<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <HeaderActionsFormCard
      ref="headerActionsFormCard"
      title="Travel Pre-Approval Requests"
      @submit.prevent="print"
    >
      <div :id="PDF_SCOPE_ID">
        <v-app-bar
          color="#fff"
          flat
          height="70"
          style="left: 0; border-bottom: 3px #f3b228 solid"
        >
          <img
            src="/yukon.svg"
            style="margin: -1.2rem -10rem 0 0"
            height="44"
          />
          <div style="margin: 0 auto !important; font-size: 14pt !important">
            <b>Out-of-Territory Travel</b>
          </div>
        </v-app-bar>

        <v-data-table
          style="margin: 1rem 0"
          dense
          :headers="headers"
          :items="travelAuthorizationPreApprovals"
          :items-per-page="MAX_PER_PAGE"
          class="elevation-1"
          hide-default-footer
        >
          <template #item.name="{ item }">
            <span> {{ item.department }}, </span>
            <span
              v-for="(profile, index) in item.profiles"
              :key="index"
              style="line-height: 1rem"
              >{{ profile.profileName.replace(".", " ") }}</span
            >
          </template>

          <template #item.travelDate="{ item }">
            <div v-if="item.isOpenForAnyDate">
              {{ item.month }}
            </div>
            <div v-else>
              <div style="line-height: 1rem">{{ formatDate(item.startDate) }}-</div>
              <div style="line-height: 1rem">
                {{ formatDate(item.endDate) }}
              </div>
            </div>
          </template>
          <template #item.estimatedCost="{ item }">
            <div style="text-align: right !important">
              {{ formatCurrency(item.estimatedCost) }}
            </div>
          </template>
          <template #body.append>
            <tr style="">
              <td
                colspan="4"
                style="border-top: 2px solid !important; font-size: 10pt !important"
              >
                <b>Total</b>
              </td>
              <td
                style="
                  border-top: 2px solid !important;
                  font-size: 10pt !important;
                  text-align: right !important;
                "
              >
                <b>{{ formatCurrency(totalCost) }}</b>
              </td>
            </tr>
          </template>
        </v-data-table>

        <v-row style="margin-top: 3rem">
          <div style="width: 10%"></div>
          <div style="width: 40%; border-top: 1px solid #333333; font-size: 8pt">
            <v-row>
              <v-col
                cols="3"
                style="padding-right: 0"
                >Approved:</v-col
              >
              <v-col style="padding-left: 0; margin-left: 0">
                <input
                  v-model="approver"
                  style="width: 100%; cursor: pointer; padding-left: 0.25rem"
                  class="yellow darken-3"
                  clearable
                />
              </v-col>
            </v-row>
          </div>
          <div style="width: 1%"></div>
          <div style="width: 10%; border-top: 1px solid #333333; font-size: 8pt">Date:</div>
        </v-row>
        <div
          style="font-size: 7pt"
          class="form-footer"
        >
          <i>Printed on: {{ currentDate }}</i>
        </div>
      </div>

      <template #actions>
        <v-btn
          color="primary"
          type="submit"
        >
          Print
          <v-icon start>mdi-printer</v-icon>
        </v-btn>
        <v-btn
          color="secondary"
          @click="hide"
        >
          Close
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { sumBy, uniqueId } from "lodash"
import { Printd } from "printd"
import { DateTime } from "luxon"

import { formatDate, formatCurrency } from "@/utils/formatters"

import { MAX_PER_PAGE } from "@/api/base-api"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const PDF_SCOPE_ID = uniqueId("pdf-scope-")

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// TODO: support passing filter options so we aren't printing all pre-approvals each time.

const headers = ref([
  {
    text: "Date of Travel ",
    value: "travelDate",
    class: "m-0 p-0",
    width: "8.5rem",
    sortable: false,
  },
  {
    text: "Purpose",
    value: "purpose",
    class: "",
  },
  {
    text: "Location",
    value: "location",
    class: "",
  },
  {
    text: "Person/Position Travelling",
    value: "name",
    class: "",
    sortable: false,
  },
  {
    text: "Estimated Travel Cost",
    value: "estimatedCost",
    class: "m-0 p-0",
    width: "7.5rem",
  },
])

const showDialog = useRouteQuery("showPrintDialog", false, {
  transform: booleanTransformer,
})

const approver = ref("")
const currentDate = ref("")

watch(
  () => showDialog.value,
  (newShowDialog) => {
    if (newShowDialog === true) {
      currentDate.value = DateTime.now().toFormat("MMMM d, yyyy")
    }
  },
  {
    immediate: true,
  }
)

const travelAuthorizationPreApprovalsQuery = computed(() => {
  return {
    where: props.where,
    filters: props.filters,
    perPage: MAX_PER_PAGE, // since we aren't rendering in the back-end we need to load as much as we can here.
  }
})
const { travelAuthorizationPreApprovals } = useTravelAuthorizationPreApprovals(
  travelAuthorizationPreApprovalsQuery,
  {
    skipWatchIf: () => showDialog.value !== true,
  }
)

const totalCost = computed(() => {
  return sumBy(travelAuthorizationPreApprovals.value, "estimatedCost")
})

function print() {
  const styles = [
    /* css */ `
      @media print {
        @page {
          size: letter landscape !important;
        }
        div.form-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          display: inline-block;
        }
        .new-page {
          page-break-before: always;
          position: relative;
          top: 8em;
        }
      }
    `,
    `https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css`,
    /* css */ `
      thead th {
        font-size: 11pt !important;
        color: #111111 !important;
        text-align: center !important;
        border: 1px solid #333334 !important;
        border-bottom: 2px solid #333334 !important;
      }
    `,
    /* css */ `
      tbody td {
        border: 1px solid #666666 !important;
      }
    `,
    /* css */ `
      table {
        border: 2px solid #333334;
      }
    `,
  ]

  const pageToPrint = window.document.getElementById(PDF_SCOPE_ID)

  if (pageToPrint) {
    const pdf = new Printd()
    setPdfTitle(pdf)
    pdf.print(pageToPrint, styles)
    hide()
  }
}

function setPdfTitle(pdf) {
  const iframe = pdf.getIFrame()

  iframe.addEventListener("load", () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document

    const currentDate = DateTime.now().toFormat("yyyy-MM-dd_HHmm")
    iframeDocument.title = `Report, Travel Pre-Approval Requests, ${currentDate}`
  })
}

function show() {
  showDialog.value = true
}

function hide() {
  showDialog.value = false
}

function hideIfFalse(value) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
  hide,
})
</script>

<style scoped>
::v-deep(tbody td) {
  font-size: 7.5pt !important;
  border: 1px solid #666666 !important;
}

::v-deep(tbody th) {
  font-size: 7pt !important;
}

::v-deep(thead th) {
  border: 1px solid #333334 !important;
  border-bottom: 2px solid #333334 !important;
  text-align: center !important;
  font-size: 9pt !important;
  color: #111111 !important;
}

::v-deep(table) {
  border: 2px solid #333334;
}

.form-footer {
  display: none;
}
</style>
