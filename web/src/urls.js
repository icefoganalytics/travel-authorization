import { API_BASE_URL } from "@/config"

// TODO: refactor these into apis/xxx-api.js files
// The base url can be handled by the axios config.
export const PROFILE_URL = `${API_BASE_URL}/api/user/me`

export const FORM_URL = `${API_BASE_URL}/api/form`
export const LOOKUP_URL = `${API_BASE_URL}/api/lookup`
export const USERS_URL = `${API_BASE_URL}/api/user`
export const TRAVEL_DESK_URL = `${API_BASE_URL}/api/traveldesk`
