declare module "vuetify/lib/components" {
  /** Instance shape for <v-form> (Vuetify 2) */
  export interface VForm extends HTMLFormElement {
    validate: () => boolean
    reset: () => void
    resetValidation: () => void
  }

  /** Constructor type so `typeof VForm` is a constructor */
  export interface VFormConstructor {
    new (): VForm
  }

  /** Value declaration used only for typing; will be erased if configured below */
  export const VForm: VFormConstructor
}
