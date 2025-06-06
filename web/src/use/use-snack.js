import { reactive, toRef } from "vue"

const state = reactive({
  message: "",
  options: {},
})

export function useSnack(defaultOptions = {}) {
  const notify = (message, options = {}) => {
    state.message = message
    state.options = {
      ...defaultOptions,
      ...options,
    }
  }

  notify.message = toRef(state, "message")
  notify.options = toRef(state, "options")

  notify.notify = notify

  notify.reset = () => {
    state.message = ""
    state.options = {}
  }

  notify.success = (message, options = {}) => {
    notify(message, { color: "success", ...options })
  }

  notify.error = (message, options = {}) => {
    notify(message, { color: "error", ...options })
  }

  notify.info = (message, options = {}) => {
    notify(message, { color: "info", ...options })
  }

  notify.warning = (message, options = {}) => {
    notify(message, { color: "warning", ...options })
  }

  return notify
}

export default useSnack
