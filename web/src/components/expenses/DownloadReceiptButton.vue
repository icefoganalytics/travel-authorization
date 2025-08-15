<template>
  <v-btn
    color="secondary"
    :loading="isLoading"
    @click="downloadFile"
  >
    View Receipt
  </v-btn>
</template>

<script>
import expensesApi from "@/api/expenses-api"

export default {
  props: {
    expenseId: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    isLoading: false,
  }),
  methods: {
    async downloadFile() {
      this.isLoading = true
      try {
        const { expense } = await expensesApi.download(this.expenseId)
        const { receiptImage, fileName } = expense
        const url = window.URL.createObjectURL(receiptImage)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } catch (error) {
        console.error(error)
        this.$snack(`Failed to download receipt: ${error}`, { color: "error" })
      } finally {
        // File download interface takes a while to show up, so this blocks the user from
        // clicking the download button a second time.
        // There's probably a better way(tm).
        setTimeout(() => {
          this.isLoading = false
        }, 3000)
      }
    },
  },
}
</script>
