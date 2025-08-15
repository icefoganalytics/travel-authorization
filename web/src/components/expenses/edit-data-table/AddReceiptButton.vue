<template>
  <span class="ml-2">
    <input
      ref="fileInput"
      class="d-none"
      type="file"
      @change="onFileSelected"
    />
    <v-btn
      color="primary"
      :loading="isLoading"
      @click="triggerFileInput"
    >
      Add Receipt
    </v-btn>
  </span>
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
  data() {
    return {
      file: null,
      isLoading: false,
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    onFileSelected(event) {
      this.file = event.target.files[0]
      this.uploadFile()
    },
    async uploadFile() {
      this.isLoading = true
      try {
        await expensesApi.upload(this.expenseId, this.file)
        this.$emit("uploaded")
        this.$snack("Receipt added", { color: "success" })
      } catch (error) {
        console.error(error)
        this.$snack(`Failed to add receipt: ${error}`, { color: "error" })
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
