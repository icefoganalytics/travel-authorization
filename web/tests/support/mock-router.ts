import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router"

export function mockRouter(routes: RouteRecordRaw[] = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  })
}

export default mockRouter
