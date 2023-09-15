<template>
  <v-overlay>
    <div class="text-center">
      <v-progress-circular indeterminate size="64" class="mb-5"></v-progress-circular>
      <h1 class="title">{{ title }}</h1>
    </div>
  </v-overlay>
</template>

<script>
import { applicationName } from "@/config";
import { getInstance } from "@/auth";

export default {
  name: "Default",
  data: () => ({
    title: `Loading ${applicationName}`,
  }),
  methods: {},
  computed: {},
  watch: {},
  async mounted() {
    const authService = getInstance();

    const autoRedirectInterval = window.setInterval(() => {
      if (authService.isLoading === false) {
        window.clearInterval(autoRedirectInterval);

        if (authService.isAuthenticated) {
          if (authService.targetUrl === this.$route.path) {
            window.clearInterval(autoRedirectInterval);
          } else if (authService.targetUrl) {
            this.$router.push(authService.targetUrl);
          } else {
            this.$router.push("/dashboard");
          }
        } else {
          this.$router.push("/sign-in");
        }
      }
    }, 1000);
  },
};
</script>
