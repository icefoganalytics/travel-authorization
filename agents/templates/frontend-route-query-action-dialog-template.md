# Frontend Route-Query Action Dialog Template

Use this shape for Vue 3 action dialogs that open from a route query record id but do not load a
remote record (e.g. deny, reject, send-back, confirm actions with a reason textarea).

```vue
<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="close"
    @update:model-value="closeIfFalse"
  >
    <HeaderActionsFormCard
      ref="formCardRef"
      title="Action Title"
      @submit.prevent="performActionAndClose"
    >
      <v-textarea
        v-model="reason"
        label="Reason *"
        placeholder="Please explain..."
        variant="outlined"
        rows="4"
        :rules="[required]"
        @keydown.ctrl.enter="performActionAndClose"
      />

      <template #actions>
        <v-btn
          color="warning"
          :loading="isSubmitting"
          type="submit"
        >
          Confirm
        </v-btn>
        <v-btn
          variant="outlined"
          :loading="isSubmitting"
          @click="close"
        >
          Cancel
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import apiModule from "@/api/api-module"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const emit = defineEmits<{
  actionDone: [recordId: number]
}>()

const recordId = useRouteQuery<string | undefined, number | undefined>(
  "showRecordAction",
  undefined,
  {
    transform: integerTransformer,
  }
)

const showDialog = ref(false)
const reason = ref("")

watch(
  recordId,
  (newId) => {
    if (isNil(newId)) {
      showDialog.value = false
      reason.value = ""
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const isSubmitting = ref(false)
const formCardRef = useTemplateRef("formCardRef")
const snack = useSnack()

async function performActionAndClose() {
  if (isNil(recordId.value)) return

  if (isNil(formCardRef.value)) return

  const { valid } = await formCardRef.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isSubmitting.value = true
  try {
    await apiModule.someAction(recordId.value, {
      reason: reason.value,
    })
    snack.success("Action completed!")
    close()

    await nextTick()
    emit("actionDone", recordId.value)
  } catch (error) {
    console.error(`Failed to perform action: ${error}`, { error })
    snack.error(`Failed to perform action: ${error}`)
  } finally {
    isSubmitting.value = false
  }
}

function open(id: number) {
  recordId.value = id
}

function close() {
  recordId.value = undefined
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) return

  close()
}

defineExpose({
  open,
})
</script>
```

## Notes

- Use `integerTransformer` for the route-query record id.
- Use `useTemplateRef("formCardRef")` for the form ref — no generic type parameter.
- Order the script as emits, route-query id state, local dialog state (`showDialog`, `reason`),
  watcher, infrastructure refs and composables (`isSubmitting`, `formCardRef`, `snack`), primary
  submit action, show/hide helpers, then `defineExpose`.
- Name the submit function by its effect (e.g. `requestChangesAndClose`, `rejectAndClose`) rather
  than `submit` — see AGENTS.md frontend code style for the event handler naming convention.
- Emit the record id on the event so the parent can refresh without re-reading the route query.
- Use `await nextTick()` after `close()` and before `emit()` so the dialog close animation finishes
  before the parent reacts.

## When to use this over the create or edit templates

| Template | Use case | Route query type | Record load |
|---|---|---|---|
| create template | Creating a new record on a parent | boolean | No |
| edit template | Editing an existing record | integer | Yes (composable) |
| **action template** | Performing an action on a record | integer | No |
