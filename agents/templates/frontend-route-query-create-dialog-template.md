# Frontend Route-Query Create Dialog Template

Use this shape for Vue 3 create dialogs that open from a route query parameter.

```vue
<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        color="primary"
        v-bind="activatorProps"
      >
        Add Thing
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndHide"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <h2>Add Thing</h2>
        </v-card-title>

        <v-card-text>
          <!-- Form fields go here. -->
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            variant="outlined"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import thingsApi, { type Thing } from "@/api/things-api"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

const props = defineProps<{
  parentId: number
}>()

const emit = defineEmits<{
  created: [thingId: number]
}>()

const showDialog = useRouteQuery("showThingCreate", "false", {
  transform: booleanTransformer,
})

const thing = ref<Partial<Thing>>({
  parentId: props.parentId,
})

watch(
  () => props.parentId,
  () => {
    resetThing()
  },
  { immediate: true }
)

const form = useTemplateRef("form")
const snack = useSnack()
const isLoading = ref(false)

async function createAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    const { thing: newThing } = await thingsApi.create(thing.value)
    hide()

    await nextTick()
    emit("created", newThing.id)
    snack.success("Thing created successfully")
  } catch (error) {
    console.error(`Failed to create thing: ${error}`, { error })
    snack.error(`Failed to create thing: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function resetThing() {
  thing.value = {
    parentId: props.parentId,
  }
}

function show() {
  showDialog.value = true
}

function hide() {
  showDialog.value = false
  resetThing()
  form.value?.resetValidation()
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
  hide,
})
</script>
```

## Notes

- Use `booleanTransformer` for boolean route-query dialog state. Do not use `Boolean`, because
  `Boolean("false")` is true.
- Keep parent identity values as explicit props, such as `parentId`; do not pass arbitrary
  `attributes` objects just to seed dialog state.
- Keep route query values for dialog state and record identifiers, not create payloads.
- Prefer `useTemplateRef("form")` for form refs.
- Order the script as props/emits, route-query dialog state, form model state, watchers, template
  refs/composables used by the submit action, primary submit action, reset helper, show/hide
  helpers, then `defineExpose`.
- Keep the main template generic. Add domain-specific fields only when the real dialog needs them.

## Field Patterns

Keep this template generic. Before adding form fields, search existing Vue components for the same
field type and follow the closest local pattern.

Useful searches:

- `rg -n "StringDateInput|:min=|:max=" web/src -g "*.vue"`
- `rg -n "v-radio-group|label=.*\\*" web/src -g "*.vue"`
- `rg -n "v-autocomplete|v-select|v-text-field" web/src -g "*.vue"`

Rules that still apply:

- Do not add unused props or imports.
- Put radio group labels on `v-radio-group` with the `label` prop instead of rendering a separate
  label element above the group.
- If a field uses optional date bounds with `:min` or `:max`, define those bounds as
  `string | null` and default them to `null`.
