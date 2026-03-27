<template>
  <v-btn
    :loading="isLoading"
    color="green"
    @click="saveWrapper"
    >Save Draft
  </v-btn>
</template>

<script>
import { mapActions, mapGetters } from "vuex"

import useSnack from "@/use/use-snack"

export default {
  name: "SaveDraftButton",
  setup() {
    const snack = useSnack()

    return {
      snack,
    }
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
    validateForm: {
      type: Function,
      required: true,
    },
  },
  computed: {
    ...mapGetters("travelAuthorization", ["isLoading"]),
  },
  async mounted() {
    await this.ensure(this.travelAuthorizationId)
  },
  methods: {
    ...mapActions("travelAuthorization", ["ensure", "save"]),
    saveWrapper() {
      if (!this.validateForm()) {
        console.error("Form submission can't be sent until the form is complete.")
        this.snack.error("Form submission can't be sent until the form is complete.")
        return
      }

      return this.save()
        .then(() => {
          this.snack.success("Form saved as a draft")
        })
        .catch((error) => {
          console.error(`Failed to save draft: ${error}`, { error })
          this.snack.error(`Failed to save draft: ${error}`)
        })
    },
  },
}
</script>
