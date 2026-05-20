# Frontend Route-Query Edit Dialog Template

Use this shape for Vue 3 edit dialogs that open from a route query record id.

```vue
<template>
  <v-dialog
    :model-value="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndHide"
    >
      <v-skeleton-loader
        v-if="isNil(thingId) || isNil(thing)"
        type="card"
      />
      <v-card
        v-else
        :loading="isLoading"
      >
        <v-card-title>
          <h2>Edit Thing</h2>
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

import thingsApi from "@/api/things-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useThing from "@/use/use-thing"

const emit = defineEmits<{
  saved: [thingId: number]
}>()

const thingId = useRouteQuery<string | undefined, number | undefined>("showThingEdit", undefined, {
  transform: integerTransformer,
})

const { thing, isLoading } = useThing(thingId)

const showDialog = ref(false)
const form = useTemplateRef("form")

watch(
  thingId,
  (newThingId) => {
    if (isNil(newThingId)) {
      showDialog.value = false
      thing.value = null
      form.value?.resetValidation()
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const snack = useSnack()

async function updateAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    if (isNil(thingId.value)) {
      throw new Error("Thing could not be found.")
    }

    if (isNil(thing.value)) {
      throw new Error("Thing could not be loaded.")
    }

    const { thing: updatedThing } = await thingsApi.update(thingId.value, thing.value)
    hide()

    await nextTick()
    emit("saved", updatedThing.id)
    snack.success("Thing saved.")
  } catch (error) {
    console.error(`Failed to save thing: ${error}`, { error })
    snack.error(`Failed to save thing: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function show(newThingId: number) {
  thingId.value = newThingId
}

function hide() {
  thingId.value = undefined
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

- Use `integerTransformer` for route-query record ids.
- Use `useTemplateRef("form")` for form refs.
- Keep route query values for dialog state and record identifiers, not edit payloads.
- Let the singular composable load the record from the route-query id.
- Render a skeleton state while the route-query id or loaded record is missing.
- When the route-query id clears, close the dialog, clear the loaded record, and reset validation.
- Order the script as props/emits, route-query id state, loaded record state, dialog visibility
  state and form ref, watcher, composables used by the submit action, primary submit action,
  show/hide helpers, then `defineExpose`.
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
