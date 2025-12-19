<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="close"
    @input="closeIfFalse"
  >
    <v-skeleton-loader
      v-if="isNil(expenseId) || isNil(expense)"
      type="card"
    />
    <HeaderActionsFormCard
      v-else
      ref="formCardRef"
      title="Reject Expense"
      @submit.prevent="rejectAndClose"
    >
      <dl class="mb-4">
        <DescriptionElement
          label="Expense Type"
          :value="expense.expenseType"
        />
        <DescriptionElement
          label="Description"
          :value="expense.description"
        />
        <DescriptionElement
          label="Date"
          :value="formatDate(expense.date)"
        />
        <DescriptionElement
          label="Amount"
          :value="formatCurrency(expense.cost)"
        />
      </dl>
      <v-textarea
        v-model="rejectionNote"
        label="Rejection Note *"
        placeholder="Please provide a reason for rejecting this expense..."
        outlined
        rows="3"
        :rules="[required]"
        @keydown.ctrl.enter="rejectAndClose"
      />

      <template #actions>
        <v-btn
          color="error"
          :loading="isLoading"
          type="submit"
        >
          Reject
        </v-btn>
        <v-btn
          color="secondary"
          :loading="isLoading"
          @click="close"
        >
          Cancel
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { isNil } from "lodash"
import { formatCurrency, formatDate } from "@/utils/formatters"
import { required } from "@/utils/validators"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import api from "@/api"
import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import useExpense from "@/use/use-expense"
import useSnack from "@/use/use-snack"

const emit = defineEmits<{
  (event: "rejected", expenseId: number): void
}>()

const expenseId = useRouteQuery<string | undefined, number | undefined>(
  "showExpenseReject",
  undefined,
  {
    transform: integerTransformer,
  }
)
const { expense, isLoading } = useExpense(expenseId)

const formCardRef = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const showDialog = ref(false)
const rejectionNote = ref("")
const snack = useSnack()

async function rejectAndClose() {
  if (isNil(expenseId.value)) return

  const isValid = formCardRef.value?.validate()
  if (!isValid) return

  isLoading.value = true
  try {
    await api.expenses.rejectApi.create(expenseId.value, {
      rejectionNote: rejectionNote.value,
    })
    close()

    await nextTick()
    emit("rejected", expenseId.value)
    snack.success("Expense rejected.")
  } catch (error) {
    console.error(`Failed to reject expense: ${error}`, { error })
    snack.error(`Failed to reject expense: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
      showDialog.value = false
      expense.value = null
      rejectionNote.value = ""
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

function open(newExpenseId: number) {
  expenseId.value = newExpenseId
}

function close() {
  expenseId.value = undefined
}

function closeIfFalse(value: boolean | null) {
  if (value !== false) {
    return
  }

  close()
}

defineExpose({
  open,
})
</script>
