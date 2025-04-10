import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import usersApi from "@/api/users-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/users-api.js').User} User */

/**
 * Provides reactive state for a user.
 *
 * @callback UseUser
 * @param {Ref<number>} userId
 * @returns {{
 *   user: Ref<User>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<User>,
 *   refresh: () => Promise<User>,
 * }}
 */

/** @type {UseUser} */
export function useUser(userId) {
  const state = reactive({
    user: {},
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { user } = await usersApi.get(unref(userId))
      state.isErrored = false
      state.user = user
      return user
    } catch (error) {
      console.error("Failed to fetch user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(userId),
    async (newUserId) => {
      if (isNil(newUserId)) return

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useUser
