import { API_BASE_URL } from "@/config"

// TODO: refactor these into apis/xxx-api.js files
// The base url can be handled by the axios config.
export const LOGIN_URL = `${API_BASE_URL}/api/auth/login`
export const AUTH_CHECK_URL = `${API_BASE_URL}/api/auth/isAuthenticated`
export const PROFILE_URL = `${API_BASE_URL}/api/user/me`

export const PLACE_URL = `${API_BASE_URL}/api/place`
export const COMMUNITY_URL = `${API_BASE_URL}/api/community`
export const STATIC_URL = `${API_BASE_URL}/api`
export const YTPLACE_URL = `${API_BASE_URL}/api/ytplace`

export const FORM_URL = `${API_BASE_URL}/api/form`
export const LOOKUP_URL = `${API_BASE_URL}/api/lookup`
export const USERS_URL = `${API_BASE_URL}/api/user`
export const TRAVEL_DESK_URL = `${API_BASE_URL}/api/traveldesk`
export const TRAVEL_COM_URL = `${API_BASE_URL}/api/travCom`
