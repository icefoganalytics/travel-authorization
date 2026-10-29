<template>
  <v-container
    v-if="isAdmin"
    class="pa-0 py-md-3 px-md-6"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>Travel Desk Product Types</h2>
        <v-btn
          color="primary"
          @click="openCreateDialog"
          >Add Product Type</v-btn
        >
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          class="mb-4"
          >{{ errorMessage }}</v-alert
        >
        <v-data-table-server
          v-model:page="page"
          v-model:items-per-page="perPage"
          :headers="headers"
          :items="productTypes"
          :loading="isLoading"
          :items-length="totalCount"
          class="mt-4"
        >
          <template #item.description="{ value }">
            <span>{{ value || "—" }}</span>
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex ga-1 justify-end">
              <v-btn
                title="Edit"
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDialog(item)"
              />
              <v-btn
                title="Delete"
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                :disabled="isBuiltIn(item.code)"
                :loading="deletingProductTypeId === item.id"
                @click="deleteProductType(item)"
              />
            </div>
          </template>
          <template #no-data>
            <div class="pa-6 text-medium-emphasis">No product types are available.</div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="isDialogOpen"
      max-width="36rem"
      :persistent="isSaving"
    >
      <v-card>
        <v-card-title>{{
          editingProductType ? "Edit Product Type" : "Add Product Type"
        }}</v-card-title>
        <v-card-text>
          <v-alert
            v-if="dialogError"
            type="error"
            class="mb-4"
            >{{ dialogError }}</v-alert
          >
          <v-form
            ref="form"
            @submit.prevent="saveProductType"
          >
            <v-text-field
              v-if="!editingProductType"
              v-model="formValues.code"
              label="Code"
              hint="Use a unique kebab-case code."
              persistent-hint
              :rules="[requiredRule]"
              :disabled="isSaving"
            />
            <v-text-field
              v-else
              :model-value="formValues.code"
              label="Code"
              disabled
            />
            <v-text-field
              v-model="formValues.name"
              label="Name"
              :rules="[requiredRule]"
              :disabled="isSaving"
            />
            <v-textarea
              v-model="formValues.description"
              label="Description"
              rows="3"
              :disabled="isSaving"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="isSaving"
            @click="closeDialog"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :loading="isSaving"
            @click="saveProductType"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-alert
    v-else
    type="error"
    >Only administrators can manage invoice product types.</v-alert
  >
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"

import useSnack from "@/use/use-snack"
import {
  travelDeskProductTypesApi,
  type TravelDeskProductType,
  type TravelDeskProductTypesQueryOptions,
} from "@/api/travel-desk-product-types-api"
import useCurrentUser from "@/use/use-current-user"
import useBreadcrumbs from "@/use/use-breadcrumbs"

const builtInProductTypeCodes = ["air", "service-fee", "credit", "change-fee"]
const headers = [
  { title: "Code", key: "code" },
  { title: "Name", key: "name" },
  { title: "Description", key: "description", sortable: false },
  { title: "", key: "actions", sortable: false, width: "8rem" },
]
const page = ref(1)
const perPage = ref(10)
const productTypes = ref<TravelDeskProductType[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const isSaving = ref(false)
const deletingProductTypeId = ref<number | null>(null)
const isDialogOpen = ref(false)
const editingProductType = ref<TravelDeskProductType | null>(null)
const dialogError = ref("")
const errorMessage = ref("")
const form = ref()
const formValues = reactive({
  code: "",
  name: "",
  description: "",
})
const { isAdmin } = useCurrentUser()
const snack = useSnack()

const query = computed<TravelDeskProductTypesQueryOptions>(() => ({
  page: page.value,
  perPage: perPage.value,
  order: [["code", "ASC"]],
}))

async function loadProductTypes() {
  isLoading.value = true
  errorMessage.value = ""
  try {
    const response = await travelDeskProductTypesApi.list(query.value)
    productTypes.value = response.travelDeskProductTypes
    totalCount.value = response.totalCount
  } catch (error) {
    console.error(error)
    errorMessage.value = `Failed to load product types: ${error}`
  } finally {
    isLoading.value = false
  }
}

function isBuiltIn(code: string) {
  return builtInProductTypeCodes.includes(code)
}

function openCreateDialog() {
  editingProductType.value = null
  formValues.code = ""
  formValues.name = ""
  formValues.description = ""
  dialogError.value = ""
  isDialogOpen.value = true
}

function openEditDialog(productType: TravelDeskProductType) {
  editingProductType.value = productType
  formValues.code = productType.code
  formValues.name = productType.name
  formValues.description = productType.description ?? ""
  dialogError.value = ""
  isDialogOpen.value = true
}

function closeDialog() {
  if (isSaving.value) return
  isDialogOpen.value = false
}

const requiredRule = (value: string) => value.trim().length > 0 || "This field is required."

async function saveProductType() {
  const validation = await form.value?.validate()
  if (validation?.valid !== true) return

  isSaving.value = true
  dialogError.value = ""
  const attributes = {
    name: formValues.name.trim(),
    description: formValues.description.trim() || null,
  }

  try {
    if (editingProductType.value) {
      await travelDeskProductTypesApi.update(editingProductType.value.id, attributes)
    } else {
      await travelDeskProductTypesApi.create({
        code: formValues.code.trim(),
        ...attributes,
      })
    }
    isDialogOpen.value = false
    await loadProductTypes()
    snack("Product type saved.", { color: "success" })
  } catch (error) {
    console.error(error)
    dialogError.value = `Failed to save product type: ${error}`
  } finally {
    isSaving.value = false
  }
}

async function deleteProductType(productType: TravelDeskProductType) {
  if (isBuiltIn(productType.code)) return
  if (
    !window.confirm(
      `Delete product type “${productType.name}”? Product types used by invoices cannot be deleted.`
    )
  )
    return

  deletingProductTypeId.value = productType.id
  errorMessage.value = ""
  try {
    await travelDeskProductTypesApi.delete(productType.id)
    await loadProductTypes()
    snack("Product type deleted.", { color: "success" })
  } catch (error) {
    console.error(error)
    errorMessage.value = `Failed to delete product type: ${error}`
  } finally {
    deletingProductTypeId.value = null
  }
}

watch(
  [query, isAdmin],
  () => {
    if (isAdmin.value) loadProductTypes()
  },
  { immediate: true }
)

useBreadcrumbs([
  { title: "Administration", to: { name: "AdministrationPage" } },
  { title: "Travel Desk Product Types", to: { name: "administration/TravelDeskProductTypesPage" } },
])
</script>
