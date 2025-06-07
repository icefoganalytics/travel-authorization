import { useSnack } from "@/use/use-snack"

const SnackPlugin = {
  install(VueInstance, defaultOptions = { timeout: 4000 }) {
    VueInstance.prototype.$snack = useSnack(defaultOptions)
  },
}

export default SnackPlugin
