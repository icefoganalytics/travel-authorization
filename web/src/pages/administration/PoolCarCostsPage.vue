<template>
  <div>
    <v-alert color="warning"> Page is not yet implemented </v-alert>

    <h1>Pool Car Costs</h1>

    <v-card class="default">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="vehicles"
          class="elevation-1"
        >
          <template #top>
            <v-toolbar elevation="0">
              <v-spacer></v-spacer>
              <v-dialog
                v-model="dialog"
                max-width="500px"
              >
                <template #activator="{ props: activatorProps }">
                  <v-btn
                    color="primary"
                    class="mb-2"
                    v-bind="activatorProps"
                  >
                    New Item
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field
                          v-model="editedItem.type"
                          density="compact"
                          variant="outlined"
                          label="Type"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field
                          v-model="editedItem.cost"
                          density="compact"
                          variant="outlined"
                          label="Cost per km"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      variant="text"
                      @click="close"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="blue darken-1"
                      variant="text"
                      @click="save"
                    >
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <v-dialog
                v-model="dialogDelete"
                max-width="500px"
              >
                <v-card>
                  <v-card-title class="text-h5"
                    >Are you sure you want to delete this item?</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      variant="text"
                      @click="closeDelete"
                      >Cancel</v-btn
                    >
                    <v-btn
                      color="blue darken-1"
                      variant="text"
                      @click="deleteItemConfirm"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template #[`item.actions`]="{ item }">
            <v-icon
              size="small"
              class="mr-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              size="small"
              @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <template #no-data>
            <v-btn
              color="primary"
              @click="initialize"
            >
              Reset
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
import { computed, nextTick, ref, watch, onMounted } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

const headers = ref([
  {
    title: "Vehicle Type",
    align: "start",
    sortable: false,
    key: "type",
  },
  {
    title: "Cost",
    key: "cost",
  },
])

const vehicles = ref([])
const editedIndex = ref(-1)
const editedItem = ref({
  type: "",
  cost: 0,
})
const defaultItem = ref({
  type: "",
  cost: 0,
})

const dialog = ref(false)
const dialogDelete = ref(false)

const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New Item" : "Edit Item"
})

watch(dialog, async (value) => {
  if (value === true) return

  await close()
})

watch(dialogDelete, async (value) => {
  if (value === true) return

  await closeDelete()
})

onMounted(() => {
  initialize()
})

async function initialize() {
  vehicles.value = [
    {
      type: "Compact Car",
      cost: 150,
    },
    {
      type: "SUV",
      cost: 237,
    },
    {
      type: "Van",
      cost: 262,
    },
    {
      type: "Truck",
      cost: 262,
    },
  ]
}

function editItem(item) {
  editedIndex.value = vehicles.value.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialog.value = true
}

function deleteItem(item) {
  editedIndex.value = vehicles.value.indexOf(item)
  editedItem.value = Object.assign({}, item)
  dialogDelete.value = true
}

async function deleteItemConfirm() {
  vehicles.value.splice(editedIndex.value, 1)
  await closeDelete()
}

async function close() {
  dialog.value = false
  await nextTick()
  editedItem.value = Object.assign({}, defaultItem.value)
  editedIndex.value = -1
}

async function closeDelete() {
  dialogDelete.value = false
  await nextTick()
  editedItem.value = Object.assign({}, defaultItem.value)
  editedIndex.value = -1
}

async function save() {
  if (editedIndex.value > -1) {
    Object.assign(vehicles.value[editedIndex.value], editedItem.value)
  } else {
    vehicles.value.push(editedItem.value)
  }
  await close()
}

useBreadcrumbs([
  {
    title: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    title: "Pool Car Costs",
    to: { name: "administration/PoolCarCostsPage" },
  },
])
</script>
